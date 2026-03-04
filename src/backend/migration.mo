import Map "mo:core/Map";
import List "mo:core/List";
import Principal "mo:core/Principal";
import Text "mo:core/Text";
import Time "mo:core/Time";

module {
  type OldUserProfile = {
    email : ?Text;
    contact : ?Text;
    isPremium : Bool;
    premiumUntil : ?Time.Time;
    pendingPremium : Bool;
    registeredAt : Time.Time;
    lastLoginAt : Time.Time;
    loginCount : Nat;
  };

  type OldEmailUser = {
    email : Text;
    passwordHash : Text;
    principalId : Principal.Principal;
    createdAt : Time.Time;
  };

  type OldPremiumCode = {
    code : Text;
    isUsed : Bool;
    createdAt : Time.Time;
  };

  type OldPasswordEntry = {
    id : Nat;
    title : Text;
    url : Text;
    username : Text;
    password : Text;
    notes : Text;
    createdAt : Time.Time;
  };

  type OldUserProfileState = {
    entries : List.List<OldPasswordEntry>;
    profile : OldUserProfile;
  };

  type OldActor = {
    userProfiles : Map.Map<Principal.Principal, OldUserProfileState>;
    emailUsers : Map.Map<Text, OldEmailUser>;
    premiumCodes : Map.Map<Text, OldPremiumCode>;
  };

  type NewUserProfile = {
    email : ?Text;
    contact : ?Text;
    isPremium : Bool;
    premiumUntil : ?Time.Time;
    pendingPremium : Bool;
    registeredAt : Time.Time;
    lastLoginAt : Time.Time;
    loginCount : Nat;
    bonusBalance : Nat;
  };

  type NewUserProfileState = {
    entries : List.List<OldPasswordEntry>;
    profile : NewUserProfile;
  };

  type NewActor = {
    userProfiles : Map.Map<Principal.Principal, NewUserProfileState>;
    emailUsers : Map.Map<Text, OldEmailUser>;
    premiumCodes : Map.Map<Text, OldPremiumCode>;
  };

  public func run(old : OldActor) : NewActor {
    let newUserProfiles = old.userProfiles.map<Principal.Principal, OldUserProfileState, NewUserProfileState>(
      func(_, state) {
        {
          entries = state.entries;
          profile = {
            email = state.profile.email;
            contact = state.profile.contact;
            isPremium = state.profile.isPremium;
            premiumUntil = state.profile.premiumUntil;
            pendingPremium = state.profile.pendingPremium;
            registeredAt = state.profile.registeredAt;
            lastLoginAt = state.profile.lastLoginAt;
            loginCount = state.profile.loginCount;
            bonusBalance = 0;
          };
        };
      }
    );
    {
      old with
      userProfiles = newUserProfiles;
    };
  };
};
