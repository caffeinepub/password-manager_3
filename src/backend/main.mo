import List "mo:core/List";
import Map "mo:core/Map";
import Time "mo:core/Time";
import Int "mo:core/Int";
import Text "mo:core/Text";
import Order "mo:core/Order";
import Array "mo:core/Array";
import Iter "mo:core/Iter";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  // Initialize the access control system
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // Data types
  type PasswordEntry = {
    id : Nat;
    title : Text;
    url : Text;
    username : Text;
    password : Text;
    notes : Text;
    createdAt : Time.Time;
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
    isPremium : Bool;
    premiumUntil : ?Time.Time;
    pendingPremium : Bool;
  };

  module UserProfile {
    public func compare(profile1 : UserProfile, profile2 : UserProfile) : Order.Order {
      switch (Bool.compare(profile1.isPremium, profile2.isPremium)) {
        case (#equal) {
          switch (Bool.compare(profile1.pendingPremium, profile2.pendingPremium)) {
            case (#equal) {
              switch (compareTimes(profile1.premiumUntil, profile2.premiumUntil)) {
                case (#equal) { #equal };
                case (order) { order };
              };
            };
            case (order) { order };
          };
        };
        case (order) { order };
      };
    };

    func compareTimes(t1 : ?Time.Time, t2 : ?Time.Time) : Order.Order {
      switch (t1, t2) {
        case (null, null) { #equal };
        case (null, _) { #less };
        case (_, null) { #greater };
        case (?time1, ?time2) { Int.compare(time1, time2) };
      };
    };
  };

  // Storage
  let userEntries = Map.empty<Principal, List.List<PasswordEntry>>();
  let userProfiles = Map.empty<Principal, UserProfile>();

  // Frontend-required functions
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Get or create user profile
  public query ({ caller }) func getMyProfile() : async UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    switch (userProfiles.get(caller)) {
      case (?profile) { profile };
      case (null) {
        let newProfile = {
          isPremium = false;
          premiumUntil = null;
          pendingPremium = false;
        };
        // Note: Cannot modify state in query, so return default profile
        newProfile;
      };
    };
  };

  // Get user entries
  public query ({ caller }) func getEntries() : async [PasswordEntry] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access entries");
    };
    switch (userEntries.get(caller)) {
      case (?entries) {
        entries.toArray().sort();
      };
      case (null) { [] };
    };
  };

  // Add entry
  public shared ({ caller }) func addEntry(
    title : Text,
    url : Text,
    username : Text,
    password : Text,
    notes : Text,
  ) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add entries");
    };

    let profile = getMyProfileInternal(caller);
    switch (userEntries.get(caller)) {
      case (?entries) {
        if ((not profile.isPremium) and (entries.size() >= 5)) {
          Runtime.trap("Free users can only store 5 entries. Please upgrade to premium for more.");
        };
        if (entries.size() >= 50) {
          Runtime.trap("Premium users can only store 50 entries. You have reached the maximum limit. Please delete some entries to add new ones.");
        };
      };
      case (null) { () };
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

    switch (userEntries.get(caller)) {
      case (?entries) { entries.add(newEntry) };
      case (null) {
        let newEntries = List.empty<PasswordEntry>();
        newEntries.add(newEntry);
        userEntries.add(caller, newEntries);
      };
    };
  };

  // Update entry
  public shared ({ caller }) func updateEntry(id : Nat, title : Text, url : Text, username : Text, password : Text, notes : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update entries");
    };

    switch (userEntries.get(caller)) {
      case (?entries) {
        let updatedEntries = entries.map<PasswordEntry, PasswordEntry>(
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
        userEntries.add(caller, updatedEntries);
      };
      case (null) { Runtime.trap("Entry does not exist") };
    };
  };

  // Delete entry
  public shared ({ caller }) func deleteEntry(id : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete entries");
    };

    switch (userEntries.get(caller)) {
      case (?entries) {
        let filteredEntries = entries.filter(
          func(entry) { entry.id != id }
        );
        userEntries.add(caller, filteredEntries);
      };
      case (null) { Runtime.trap("Entry does not exist") };
    };
  };

  // Request premium
  public shared ({ caller }) func requestPremium() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can request premium");
    };

    let profile = getMyProfileInternal(caller);
    let updatedProfile = {
      isPremium = profile.isPremium;
      premiumUntil = profile.premiumUntil;
      pendingPremium = true;
    };
    userProfiles.add(caller, updatedProfile);
  };

  // Admin functions
  public shared ({ caller }) func activatePremium(user : Principal) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can activate premium");
    };

    let profile = getMyProfileInternal(user);
    let thirtyDaysInNanos : Time.Time = 30 * 24 * 60 * 60 * 1_000_000_000;
    let updatedProfile = {
      isPremium = true;
      premiumUntil = ?(Time.now() + thirtyDaysInNanos);
      pendingPremium = false;
    };
    userProfiles.add(user, updatedProfile);
  };

  public query ({ caller }) func getAllUsers() : async [(Principal, UserProfile)] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view all users");
    };

    userProfiles.entries().toArray();
  };

  public query ({ caller }) func getPendingPremiumRequests() : async [(Principal, UserProfile)] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view pending premium requests");
    };

    userProfiles.entries().toArray().filter(
      func((principal, profile) : (Principal, UserProfile)) : Bool {
        profile.pendingPremium;
      }
    );
  };

  // Helper functions
  func getMyProfileInternal(caller : Principal) : UserProfile {
    switch (userProfiles.get(caller)) {
      case (?profile) { profile };
      case (null) {
        let newProfile = {
          isPremium = false;
          premiumUntil = null;
          pendingPremium = false;
        };
        userProfiles.add(caller, newProfile);
        newProfile;
      };
    };
  };

  func getNextId(caller : Principal, next : Nat) : Nat {
    switch (userEntries.get(caller)) {
      case (?entries) { entries.size() + next };
      case (null) { next };
    };
  };
};
