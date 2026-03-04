import List "mo:core/List";
import Map "mo:core/Map";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Nat "mo:core/Nat";
import Array "mo:core/Array";
import Int "mo:core/Int";
import Order "mo:core/Order";
import Principal "mo:core/Principal";
import Iter "mo:core/Iter";
import Runtime "mo:core/Runtime";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";

actor {
  module PremiumCode {
    public func compare(code1 : PremiumCode, code2 : PremiumCode) : Order.Order {
      Int.compare(code1.createdAt, code2.createdAt);
    };
  };

  module PasswordEntry {
    public func compare(entry1 : PasswordEntry, entry2 : PasswordEntry) : Order.Order {
      switch (Text.compare(entry1.title, entry2.title)) {
        case (#equal) { Int.compare(entry1.createdAt, entry2.createdAt) };
        case (order) { order };
      };
    };
  };

  public type UserProfile = {
    email : ?Text;
    contact : ?Text;
    isPremium : Bool;
    premiumUntil : ?Time.Time;
    pendingPremium : Bool;
    registeredAt : Time.Time;
    lastLoginAt : Time.Time;
    loginCount : Nat;
  };

  public type EmailUser = {
    email : Text;
    passwordHash : Text;
    principalId : Principal;
    createdAt : Time.Time;
  };

  public type PremiumCode = {
    code : Text;
    isUsed : Bool;
    createdAt : Time.Time;
  };

  public type PasswordEntry = {
    id : Nat;
    title : Text;
    url : Text;
    username : Text;
    password : Text;
    notes : Text;
    createdAt : Time.Time;
  };

  type UserProfileState = {
    entries : List.List<PasswordEntry>;
    profile : UserProfile;
  };

  let userProfiles = Map.empty<Principal, UserProfileState>();
  let emailUsers = Map.empty<Text, EmailUser>();
  let premiumCodes = Map.empty<Text, PremiumCode>();

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  let adminPassword = "fftr56#^";

  // Helper function to verify admin access
  func verifyAdmin(adminPasswordInput : Text) {
    if (adminPasswordInput != adminPassword) {
      Runtime.trap("Unauthorized");
    };
  };

  // Open to all - email users register as anonymous callers
  public shared ({ caller }) func registerEmailUser(email : Text, passwordHash : Text, contact : Text) : async Bool {
    if (email == "" or not email.contains(#char '@')) {
      Runtime.trap("Invalid email address");
    };

    if (contact == "") {
      Runtime.trap("Contact can't be an empty string");
    };

    switch (emailUsers.get(email)) {
      case (?_) { Runtime.trap("Email already registered") };
      case (null) {};
    };

    let now = Time.now();

    let emailUser : EmailUser = {
      email;
      passwordHash;
      principalId = caller;
      createdAt = now;
    };

    let userProfile : UserProfile = {
      email = ?email;
      contact = ?contact;
      isPremium = false;
      premiumUntil = null;
      pendingPremium = false;
      registeredAt = now;
      lastLoginAt = now;
      loginCount = 1;
    };

    let userProfileState = {
      entries = List.empty<PasswordEntry>();
      profile = userProfile;
    };

    userProfiles.add(caller, userProfileState);
    emailUsers.add(email, emailUser);
    true;
  };

  // Open to all - email users login as anonymous callers
  public shared ({ caller }) func loginEmailUser(email : Text, passwordHash : Text) : async Bool {
    switch (emailUsers.get(email)) {
      case (null) { Runtime.trap("Email not found") };
      case (?emailUser) {
        if (emailUser.passwordHash != passwordHash) {
          Runtime.trap("Invalid email or password");
        };

        let originalPrincipal = emailUser.principalId;
        switch (userProfiles.get(originalPrincipal)) {
          case (null) { Runtime.trap("User profile not found") };
          case (?profileState) {
            let now = Time.now();
            let updatedProfileState = {
              entries = profileState.entries;
              profile = {
                profileState.profile with
                lastLoginAt = now;
                loginCount = profileState.profile.loginCount + 1;
              };
            };
            // Copy profile to current caller (new anonymous principal for this session)
            userProfiles.add(caller, updatedProfileState);
            // Also update the original principal's profile
            userProfiles.add(originalPrincipal, updatedProfileState);

            // Update emailUsers to track the current session's principal
            let updatedEmailUser = {
              emailUser with principalId = caller;
            };
            emailUsers.add(email, updatedEmailUser);
          };
        };
      };
    };
    true;
  };

  public shared ({ caller }) func addDefaultProfile() : async () {
    if (caller.isAnonymous()) {
      Runtime.trap("Anonymous users cannot create profiles");
    };

    let now = Time.now();
    let defaultProfile = {
      email = null;
      contact = null;
      isPremium = false;
      premiumUntil = null;
      pendingPremium = false;
      registeredAt = now;
      lastLoginAt = now;
      loginCount = 0;
    };
    let userProfileState = { entries = List.empty<PasswordEntry>(); profile = defaultProfile };
    userProfiles.add(caller, userProfileState);
  };

  // Open to all - data isolation via caller principal
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    getMyProfileInternal(caller);
  };

  public query ({ caller }) func getMyProfile() : async ?UserProfile {
    getMyProfileInternal(caller);
  };

  func getMyProfileInternal(caller : Principal) : ?UserProfile {
    switch (userProfiles.get(caller)) {
      case (?profileState) { ?profileState.profile };
      case null { null };
    };
  };

  // Admin can view any profile, users can only view their own
  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    switch (userProfiles.get(user)) {
      case (?u) { ?u.profile };
      case null { null };
    };
  };

  // Open to all - data isolation via caller principal
  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    switch (userProfiles.get(caller)) {
      case (?profileState) {
        let updatedProfileState = { profileState with profile };
        userProfiles.add(caller, updatedProfileState);
      };
      case (null) {
        userProfiles.add(caller, { entries = List.empty<PasswordEntry>(); profile });
      };
    };
  };

  // Open to all - data isolation via caller principal
  public query ({ caller }) func getEntries() : async [PasswordEntry] {
    switch (userProfiles.get(caller)) {
      case (?profileState) { profileState.entries.toArray().sort() };
      case (null) { [] };
    };
  };

  // Open to all - data isolation via caller principal
  public shared ({ caller }) func addEntry(title : Text, url : Text, username : Text, password : Text, notes : Text) : async () {
    let newEntry : PasswordEntry = {
      id = getNextId(caller, 1);
      title;
      url;
      username;
      password;
      notes;
      createdAt = Time.now();
    };

    switch (userProfiles.get(caller)) {
      case (null) {
        Runtime.trap("No profile exists");
      };
      case (?profileState) {
        if ((not profileState.profile.isPremium) and (profileState.entries.size() >= 5)) {
          Runtime.trap("Free users can only store 5 entries. Please upgrade to premium for more.");
        };
        if (profileState.entries.size() >= 50) {
          Runtime.trap("Premium users can only store 50 entries. You have reached the maximum limit. Please delete some entries to add new ones.");
        };

        profileState.entries.add(newEntry);
      };
    };
  };

  // Open to all - data isolation via caller principal
  public shared ({ caller }) func updateEntry(id : Nat, title : Text, url : Text, username : Text, password : Text, notes : Text) : async () {
    switch (userProfiles.get(caller)) {
      case (?profileState) {
        let newEntries = profileState.entries.map<PasswordEntry, PasswordEntry>(
          func(entry) {
            if (entry.id == id) {
              {
                id = entry.id;
                title;
                url;
                username;
                password;
                notes;
                createdAt = entry.createdAt;
              };
            } else {
              entry;
            };
          }
        );
        profileState.entries.clear();
        let iterNewEntries = newEntries.reverseValues().toArray();
        for (entry in iterNewEntries.values()) {
          profileState.entries.add(entry);
        };
      };
      case (null) { Runtime.trap("Entry does not exist") };
    };
  };

  // Open to all - data isolation via caller principal
  public shared ({ caller }) func deleteEntry(id : Nat) : async () {
    switch (userProfiles.get(caller)) {
      case (?profileState) {
        let filteredEntries = profileState.entries.filter(
          func(entry) { entry.id != id }
        );
        profileState.entries.clear();
        let filteredIter = filteredEntries.reverseValues().toArray();
        for (entry in filteredIter.values()) {
          profileState.entries.add(entry);
        };
      };
      case (null) { Runtime.trap("Entry does not exist") };
    };
  };

  // Open to all - data isolation via caller principal
  public shared ({ caller }) func requestPremium() : async () {
    switch (userProfiles.get(caller)) {
      case (?profileState) {
        let newProfile = {
          profileState.profile with
          pendingPremium = true;
        };
        let updatedProfileState = { profileState with profile = newProfile };
        userProfiles.add(caller, updatedProfileState);
      };
      case (null) {
        let now = Time.now();
        let newProfile = {
          email = null;
          contact = null;
          isPremium = false;
          premiumUntil = null;
          pendingPremium = true;
          registeredAt = now;
          lastLoginAt = now;
          loginCount = 0;
        };
        userProfiles.add(caller, { entries = List.empty<PasswordEntry>(); profile = newProfile });
      };
    };
  };

  // Admin only - requires password
  public query ({ caller }) func getAllUsers(adminPasswordInput : Text) : async [(Principal, UserProfile)] {
    verifyAdmin(adminPasswordInput);
    userProfiles.toArray().map(func((principal, profileState)) { (principal, profileState.profile) });
  };

  // Admin only - requires password
  public query ({ caller }) func getPendingPremiumRequests(adminPasswordInput : Text) : async [(Principal, UserProfile)] {
    verifyAdmin(adminPasswordInput);
    userProfiles.toArray().map(func((principal, profileState)) { (principal, profileState.profile) }).filter(
      func((_, profile)) {
        profile.pendingPremium;
      }
    );
  };

  // Admin only - requires password
  public shared ({ caller }) func activatePremium(user : Principal, adminPasswordInput : Text) : async () {
    verifyAdmin(adminPasswordInput);
    let thirtyDaysInNanos = 30 * 24 * 60 * 60 * 1_000_000_000 : Time.Time;

    switch (userProfiles.get(user)) {
      case (null) {
        Runtime.trap("Profile does not exist");
      };
      case (?profileState) {
        let newProfile = {
          profileState.profile with
          isPremium = true;
          premiumUntil = ?(Time.now() + thirtyDaysInNanos);
          pendingPremium = false;
        };
        let updatedProfileState = { profileState with profile = newProfile };
        userProfiles.add(user, updatedProfileState);
      };
    };
  };

  // Admin only - requires password
  public shared ({ caller }) func createPremiumCode(code : Text, adminPasswordInput : Text) : async () {
    verifyAdmin(adminPasswordInput);

    if (code.size() < 4) {
      Runtime.trap("Code must be at least 4 characters long");
    };
    let newCode = {
      code;
      isUsed = false;
      createdAt = Time.now();
    };

    premiumCodes.add(code, newCode);
  };

  // Admin only - requires password
  public query ({ caller }) func getPremiumCodes(adminPasswordInput : Text) : async [PremiumCode] {
    verifyAdmin(adminPasswordInput);
    premiumCodes.values().toArray();
  };

  // Open to all - just checks if code exists
  public query ({ caller }) func validateCode(code : Text) : async Bool {
    premiumCodes.containsKey(code);
  };

  // Open to all - data isolation via caller principal
  public shared ({ caller }) func redeemPremiumCode(code : Text) : async () {
    switch (premiumCodes.get(code)) {
      case (null) { Runtime.trap("Premium code not found") };
      case (?premiumCode) {
        if (premiumCode.isUsed) { Runtime.trap("Premium code already used") };

        switch (userProfiles.get(caller)) {
          case (null) { Runtime.trap("Profile does not exist") };
          case (?profileState) {
            let newProfile = {
              profileState.profile with
              isPremium = true;
              premiumUntil = ?(Time.now() + (30 * 24 * 60 * 60 * 1_000_000_000 : Time.Time));
              pendingPremium = false;
            };
            let updatedProfileState = { profileState with profile = newProfile };
            userProfiles.add(caller, updatedProfileState);
          };
        };

        let updatedCode = {
          premiumCode with isUsed = true;
        };
        premiumCodes.add(code, updatedCode);
      };
    };
  };

  // Admin only - requires password
  public query ({ caller }) func getEmailByPrincipal(user : Principal, adminPasswordInput : Text) : async ?Text {
    verifyAdmin(adminPasswordInput);
    switch (userProfiles.get(user)) {
      case (null) { null };
      case (?profileState) { profileState.profile.email };
    };
  };

  func getNextId(caller : Principal, next : Nat) : Nat {
    switch (userProfiles.get(caller)) {
      case (?userProfileState) { userProfileState.entries.size() + next };
      case (null) { next };
    };
  };
};
