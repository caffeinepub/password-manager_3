import List "mo:core/List";
import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Text "mo:core/Text";
import Blob "mo:core/Blob";
import Time "mo:core/Time";
import Array "mo:core/Array";
import Int "mo:core/Int";
import Order "mo:core/Order";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import Iter "mo:core/Iter";
import MixinAuthorization "authorization/MixinAuthorization";

import AccessControl "authorization/access-control";


actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

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
    phone : ?Text;
    isPremium : Bool;
    premiumUntil : ?Time.Time;
    pendingPremium : Bool;
  };

  public type PhoneUser = {
    phone : Text;
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
  let phoneUsers = Map.empty<Text, PhoneUser>();
  let premiumCodes = Map.empty<Text, PremiumCode>();

  public shared ({ caller }) func registerPhoneUser(phone : Text, passwordHash : Text) : async Bool {
    // No authorization check - registration should be open to everyone including anonymous
    if (phone == "" or not phone.startsWith(#char '+')) { Runtime.trap("Phone must start with +") };
    switch (phoneUsers.get(phone)) {
      case (?_) { Runtime.trap("Phone already registered") };
      case (null) {};
    };

    let phoneUser : PhoneUser = {
      phone = phone;
      passwordHash = passwordHash;
      principalId = caller;
      createdAt = Time.now();
    };

    let userProfile = {
      phone = ?phone;
      isPremium = false;
      premiumUntil = null;
      pendingPremium = false;
    };
    let userProfileState = { entries = List.empty<PasswordEntry>(); profile = userProfile };

    userProfiles.add(caller, userProfileState);
    AccessControl.assignRole(accessControlState, caller, caller, #user);
    phoneUsers.add(phone, phoneUser);
    true;
  };

  public shared ({ caller }) func loginPhoneUser(phone : Text, passwordHash : Text) : async Bool {
    // No authorization check - login should be open to everyone including anonymous
    switch (phoneUsers.get(phone)) {
      case (null) { Runtime.trap("Phone not found") };
      case (?phoneUser) {
        if (phoneUser.passwordHash != passwordHash) {
          Runtime.trap("Invalid phone or password");
        };

        // Link caller's principal to the original user's profile
        let originalPrincipal = phoneUser.principalId;
        switch (userProfiles.get(originalPrincipal)) {
          case (null) { Runtime.trap("User profile not found") };
          case (?profileState) {
            // Copy the profile to the new principal (caller)
            userProfiles.add(caller, profileState);
            // Assign user role to the caller
            AccessControl.assignRole(accessControlState, caller, caller, #user);
            // Update the phone user mapping to point to the new principal
            let updatedPhoneUser = {
              phoneUser with principalId = caller;
            };
            phoneUsers.add(phone, updatedPhoneUser);
          };
        };
      };
    };
    true;
  };

  public shared ({ caller }) func addDefaultProfile() : async () {
    // This function should not be publicly accessible without restrictions
    // Adding authorization check to prevent abuse
    if (caller.isAnonymous()) {
      Runtime.trap("Unauthorized: Anonymous users cannot create profiles directly");
    };

    let defaultProfile = {
      phone = null;
      isPremium = false;
      premiumUntil = null;
      pendingPremium = false;
    };
    let userProfileState = { entries = List.empty<PasswordEntry>(); profile = defaultProfile };
    userProfiles.add(caller, userProfileState);
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    switch (userProfiles.get(caller)) {
      case (?profileState) { ?profileState.profile };
      case (null) { null };
    };
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    switch (userProfiles.get(user)) {
      case (?u) { ?u.profile };
      case null { null };
    };
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    switch (userProfiles.get(caller)) {
      case (?profileState) {
        let updatedProfileState = { profileState with profile };
        userProfiles.add(caller, updatedProfileState);
      };
      case (null) { userProfiles.add(caller, { entries = List.empty<PasswordEntry>(); profile }) };
    };
  };

  public query ({ caller }) func getMyProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };

    switch (userProfiles.get(caller)) {
      case (?profileState) { ?profileState.profile };
      case null { null };
    };
  };

  public query ({ caller }) func getEntries() : async [PasswordEntry] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access entries");
    };

    switch (userProfiles.get(caller)) {
      case (?profileState) { profileState.entries.toArray().sort() };
      case (null) { [] };
    };
  };

  public shared ({ caller }) func addEntry(title : Text, url : Text, username : Text, password : Text, notes : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add entries");
    };
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
        Runtime.trap("Tu jeszcze nie ma profilu");
      };
      case (?profileState) {
        if ((not profileState.profile.isPremium) and (profileState.entries.size() >= 5)) {
          Runtime.trap("Free users can only store 5 entries. Please upgrade to premium for more.");
        };
        if (profileState.entries.size() >= 50) {
          Runtime.trap("Premium users can only store 50 entries. You have reached the maximum limit. Please delete some entries to add new ones.");
        };

        let newEntries = { entry = (newEntry : PasswordEntry) };
        profileState.entries.add(newEntry);
      };
    };
  };

  public shared ({ caller }) func updateEntry(id : Nat, title : Text, url : Text, username : Text, password : Text, notes : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update entries");
    };
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

  public shared ({ caller }) func deleteEntry(id : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete entries");
    };
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

  public shared ({ caller }) func requestPremium() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can request premium");
    };
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
        let newProfile = {
          phone = null;
          isPremium = false;
          premiumUntil = null;
          pendingPremium = true;
        };
        userProfiles.add(caller, { entries = List.empty<PasswordEntry>(); profile = newProfile });
      };
    };
  };

  public query ({ caller }) func getAllUsers() : async [(Principal, UserProfile)] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view all users");
    };

    userProfiles.toArray().map(func((principal, profileState)) { (principal, profileState.profile) });
  };

  public query ({ caller }) func getPendingPremiumRequests() : async [(Principal, UserProfile)] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view pending premium requests");
    };

    userProfiles.toArray().map(func((principal, profileState)) { (principal, profileState.profile) }).filter(
      func((_, profile)) {
        profile.pendingPremium;
      }
    );
  };

  public shared ({ caller }) func activatePremium(user : Principal) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can activate premium");
    };
    let thirtyDaysInNanos = 30 * 24 * 60 * 60 * 1_000_000_000 : Time.Time;

    switch (userProfiles.get(user)) {
      case (null) {
        Runtime.trap("Profil nie istnieje");
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

  public shared ({ caller }) func createPremiumCode(code : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can create premium codes");
    };
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

  public query ({ caller }) func getPremiumCodes() : async [PremiumCode] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view premium codes");
    };
    premiumCodes.values().toArray();
  };

  public query ({ caller }) func validateCode(code : Text) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can validate codes");
    };
    premiumCodes.containsKey(code);
  };

  public shared ({ caller }) func redeemPremiumCode(code : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can redeem premium codes");
    };
    let thirtyDaysInNanos = 30 * 24 * 60 * 60 * 1_000_000_000 : Time.Time;

    switch (premiumCodes.get(code)) {
      case (null) { Runtime.trap("Premium code not found") };
      case (?premiumCode) {
        if (premiumCode.isUsed) { Runtime.trap("Premium code already used") };

        switch (userProfiles.get(caller)) {
          case (null) {
            Runtime.trap("Profil nie istnieje");
          };
          case (?profileState) {
            let newProfile = {
              profileState.profile with
              isPremium = true;
              premiumUntil = ?(Time.now() + thirtyDaysInNanos);
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

  public query ({ caller }) func getPhoneByPrincipal(user : Principal) : async ?Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can get phone numbers");
    };
    switch (userProfiles.get(user)) {
      case (null) { null };
      case (?profileState) { profileState.profile.phone };
    };
  };

  func getNextId(caller : Principal, next : Nat) : Nat {
    switch (userProfiles.get(caller)) {
      case (?userProfileState) { userProfileState.entries.size() + next };
      case (null) { next };
    };
  };
};
