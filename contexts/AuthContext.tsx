import React, { createContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { User as AuthUser } from '@supabase/supabase-js'; // Supabase's user type
import { supabase } from '../src/supabaseClient.ts';
import { User, UserType, BarbershopProfile, BarbershopSubscription, SubscriptionPlanTier, UserMetadata, AppMetadata } from '../types';
import { 
  // mockLogin, (replaced)
  // mockSignupClient, (replaced)
  // mockSignupBarbershop, (replaced)
  // mockLogout, (replaced)
  mockGetBarbershopProfile, 
  mockUpdateBarbershopProfile, 
  mockGetBarbershopSubscription, 
  mockUpdateBarbershopSubscription,
  mockUpdateClientProfile // This will need to become a Supabase call eventually
} from '../services/mockApiService'; // Keep these for now, will be replaced later
import { useNotification } from './NotificationContext';

// Helper to map Supabase user to our app's User type
const mapSupabaseUserToAppUser = (supabaseUser: AuthUser | null): User | null => {
  if (!supabaseUser) return null;

  const userMetadata = supabaseUser.user_metadata as UserMetadata || {};
  const appMetadata = supabaseUser.app_metadata as AppMetadata || {};

  return {
    id: supabaseUser.id,
    email: supabaseUser.email,
    user_metadata: userMetadata,
    app_metadata: appMetadata,
    // For compatibility with existing code, derive these here.
    // Ideally, components would use user.user_metadata.name directly.
    name: userMetadata.name,
    phone: userMetadata.phone,
    type: appMetadata.user_type || UserType.CLIENT, // Default to client if not set
    barbershopName: appMetadata.barbershop_name,
    address: appMetadata.initial_address,
  };
};

interface AuthContextType {
  user: User | null;
  barbershopProfile: BarbershopProfile | null; // Will be fetched from Supabase later
  barbershopSubscription: BarbershopSubscription | null; // Will be fetched from Supabase later
  loading: boolean;
  login: (email: string, pass: string) => Promise<User | null>;
  signupClient: (name: string, email: string, phone: string, pass: string) => Promise<User | null>;
  signupBarbershop: (barbershopName: string, responsible: string, email: string, phone: string, address: string, pass: string) => Promise<User | null>;
  logout: () => Promise<void>;
  updateBarbershopProfile: (profileData: Partial<BarbershopProfile>) => Promise<boolean>; // Stays mock for now
  updateClientProfile: (clientId: string, profileData: Partial<Pick<User, 'name' | 'phone' | 'email'>>) => Promise<boolean>; // Stays mock for now
  updateSubscription: (planId: SubscriptionPlanTier) => Promise<boolean>; // Stays mock for now
  refreshUserData: () => Promise<void>; 
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [barbershopProfile, setBarbershopProfile] = useState<BarbershopProfile | null>(null);
  const [barbershopSubscription, setBarbershopSubscription] = useState<BarbershopSubscription | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const { addNotification } = useNotification();

  // TODO: Refactor to fetch from Supabase 'barbershop_profiles' and 'subscriptions' tables based on user.id
  const loadUserDataForAdmin = useCallback(async (adminUser: User) => {
    // This part remains mock for now, or would be adapted for Supabase tables
    if (adminUser.type === UserType.ADMIN && adminUser.id) {
        console.warn("loadUserDataForAdmin is using mock data. Needs Supabase integration.");
        const profile = await mockGetBarbershopProfile(adminUser.id);
        setBarbershopProfile(profile);
        const subscription = await mockGetBarbershopSubscription(adminUser.id);
        setBarbershopSubscription(subscription);
    }
  }, []);
  
  useEffect(() => {
    setLoading(true);
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const appUser = mapSupabaseUserToAppUser(session?.user || null);
      setUser(appUser);
      if (appUser && appUser.type === UserType.ADMIN) {
        await loadUserDataForAdmin(appUser);
      }
      setLoading(false);
    };
    getSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setLoading(true);
      const appUser = mapSupabaseUserToAppUser(session?.user || null);
      setUser(appUser);
      if (appUser && appUser.type === UserType.ADMIN) {
        await loadUserDataForAdmin(appUser);
      } else {
        setBarbershopProfile(null);
        setBarbershopSubscription(null);
      }
      setLoading(false);
    });

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, [loadUserDataForAdmin]);


  const login = async (email: string, pass: string): Promise<User | null> => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password: pass });
      if (error) {
        addNotification({ message: error.message || 'Credenciais inválidas.', type: 'error' });
        return null;
      }
      if (data.user) {
        const appUser = mapSupabaseUserToAppUser(data.user);
        // User state will be set by onAuthStateChange listener
        // if (appUser && appUser.type === UserType.ADMIN) {
        //   await loadUserDataForAdmin(appUser);
        // }
        return appUser;
      }
      return null;
    } catch (error) {
      addNotification({ message: `Erro no login: ${(error as Error).message}`, type: 'error' });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const signupClient = async (name: string, email: string, phone: string, pass: string): Promise<User | null> => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password: pass,
        options: {
          data: { // This goes into user_metadata by default in Supabase
            name,
            phone,
          },
          // app_metadata is typically set server-side or via admin SDK for security reasons.
          // For client-side signup, we can put type in user_metadata or handle it post-signup.
          // Here, we'll aim to set it in app_metadata if possible, or user_metadata.
          // Supabase's client-side signUp options.data goes to user_metadata.
          // To set app_metadata.user_type, it's better done with a function/trigger on Supabase side,
          // or have the user select type if it's dynamic.
          // For now, type will be part of user_metadata for simplicity during client signup.
        }
      });

      if (error) {
        addNotification({ message: error.message || 'Erro no cadastro.', type: 'error' });
        return null;
      }
       if (data.user) {
        // Update user metadata to include user_type.
        // This is a workaround as client-side signUp options.data primarily targets user_metadata.
        // A more robust solution involves a Supabase function or a post-signup profile creation step.
        const { error: updateError } = await supabase.auth.updateUser({
            data: { ...data.user.user_metadata, user_type: UserType.CLIENT } // Add type to user_metadata
        });
        if (updateError) {
            console.warn("Could not set user_type post-signup:", updateError.message);
        }
        return mapSupabaseUserToAppUser(data.user); // User state will be set by listener
      }
      return null;
    } catch (error) {
      addNotification({ message: `Erro no cadastro: ${(error as Error).message}`, type: 'error' });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const signupBarbershop = async (barbershopName: string, responsibleName: string, email: string, phone: string, address: string, pass: string): Promise<User | null> => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password: pass,
        options: {
          data: { // user_metadata
            name: responsibleName,
            phone,
            // Custom app-specific role/type and barbershop info
            user_type: UserType.ADMIN, 
            barbershop_name: barbershopName,
            initial_address: address,
          }
        }
      });

      if (error) {
        addNotification({ message: error.message || 'Erro no cadastro da barbearia.', type: 'error' });
        return null;
      }
      if (data.user) {
        // TODO: After user creation, insert a record into your 'barbershop_profiles' table
        // and 'barbershop_subscriptions' table (e.g., with a default free plan).
        // This requires Supabase tables to be set up.
        // Example (pseudo-code, actual implementation depends on your tables):
        // await supabase.from('barbershop_profiles').insert({ 
        //   id: data.user.id, // Link to auth user
        //   name: barbershopName, 
        //   responsibleName, 
        //   email, phone, address, 
        //   workingHours: DEFAULT_BARBERSHOP_WORKING_HOURS 
        // });
        // await supabase.from('barbershop_subscriptions').insert({ 
        //   barbershopId: data.user.id, 
        //   planId: SubscriptionPlanTier.FREE, 
        //   status: 'active', 
        //   startDate: new Date().toISOString() 
        // });
        addNotification({ message: 'Conta de administrador criada. Configure sua barbearia após o login.', type: 'info' });
        return mapSupabaseUserToAppUser(data.user); // User state set by listener
      }
      return null;
    } catch (error) {
      addNotification({ message: `Erro no cadastro: ${(error as Error).message}`, type: 'error' });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    await supabase.auth.signOut();
    // User state will be cleared by onAuthStateChange listener
    setBarbershopProfile(null);
    setBarbershopSubscription(null);
    addNotification({ message: 'Logout realizado com sucesso.', type: 'info' });
    setLoading(false);
  };
  
  // These functions remain mock for now, or would need full Supabase data service implementation
  const updateBarbershopProfileInternal = async (profileData: Partial<BarbershopProfile>) => {
    if (user && user.type === UserType.ADMIN) {
        addNotification({ message: 'Atualização de perfil da barbearia ainda usa mock API.', type: 'warning' });
        // setLoading(true); // Example if it were async
        // const success = await mockUpdateBarbershopProfile(user.id, profileData);
        // if (success) await refreshUserDataInternal();
        // setLoading(false);
        // return success;
        return false; 
    }
    return false;
  };

  const updateClientProfileInternal = async (clientId: string, profileData: Partial<Pick<User, 'name' | 'phone' | 'email'>>) => {
     if (user && user.id === clientId) {
        setLoading(true);
        try {
            // In Supabase, email change requires verification. Name/phone are in user_metadata.
            const updates: { data?: UserMetadata, email?: string } = {};
            updates.data = { ...user.user_metadata };
            
            let emailChanged = false;
            if (profileData.name && profileData.name !== user.user_metadata?.name) {
                updates.data.name = profileData.name;
            }
            if (profileData.phone && profileData.phone !== user.user_metadata?.phone) {
                updates.data.phone = profileData.phone;
            }
            if (profileData.email && profileData.email !== user.email) {
                updates.email = profileData.email; // This will trigger a confirmation email from Supabase
                emailChanged = true;
            }
            
            const { data: updatedUser, error } = await supabase.auth.updateUser(updates);

            if (error) {
                addNotification({ message: `Erro ao atualizar perfil: ${error.message}`, type: 'error' });
                return false;
            }
            if (updatedUser) {
                 // User state will be updated by onAuthStateChange listener after metadata/email change.
                addNotification({ message: `Perfil atualizado! ${emailChanged ? 'Verifique seu e-mail para confirmar a alteração de endereço.' : ''}` , type: 'success' });
                return true;
            }
            return false;
        } catch (error) {
            addNotification({ message: `Erro ao atualizar perfil: ${(error as Error).message}`, type: 'error' });
            return false;
        } finally {
            setLoading(false);
        }
    }
    return false;
  };
  
  const updateSubscriptionInternal = async (planId: SubscriptionPlanTier) => {
     if (user && user.type === UserType.ADMIN) {
        addNotification({ message: 'Atualização de assinatura ainda usa mock API.', type: 'warning' });
        // const success = await mockUpdateBarbershopSubscription(user.id, planId);
        // if (success) await refreshUserDataInternal();
        // return success;
        return false;
     }
     return false;
  };

  const refreshUserDataInternal = useCallback(async () => {
    setLoading(true);
    const { data: { session }, error } = await supabase.auth.refreshSession(); // Or getSession()
     if (error) {
        console.error("Error refreshing session:", error.message);
        // Potentially handle logout if session is invalid
        // await supabase.auth.signOut();
     }
    const appUser = mapSupabaseUserToAppUser(session?.user || null);
    setUser(appUser);
    if (appUser && appUser.type === UserType.ADMIN) {
      await loadUserDataForAdmin(appUser);
    }
    setLoading(false);
  }, [loadUserDataForAdmin]);


  return (
    <AuthContext.Provider value={{ 
        user, 
        barbershopProfile, 
        barbershopSubscription, 
        loading, 
        login, 
        signupClient, 
        signupBarbershop, 
        logout, 
        updateBarbershopProfile: updateBarbershopProfileInternal, 
        updateClientProfile: updateClientProfileInternal,
        updateSubscription: updateSubscriptionInternal, 
        refreshUserData: refreshUserDataInternal 
    }}>
      {children}
    </AuthContext.Provider>
  );
};