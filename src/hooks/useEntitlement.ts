import { useState, useEffect } from 'react';
import { supabase, Entitlement } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export function useEntitlement() {
  const { user } = useAuth();
  const [entitlement, setEntitlement] = useState<Entitlement | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const hasAccess = entitlement?.has_active_access ?? false;

  useEffect(() => {
    if (!user) {
      setEntitlement(null);
      setLoading(false);
      return;
    }

    loadEntitlement();
  }, [user]);

  async function loadEntitlement() {
    if (!user) return;

    setLoading(true);
    setError(null);

    const { data, error: fetchError } = await supabase
      .from('entitlements')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      // PGRST116 = no rows returned, which is expected for new users
      console.error('Error loading entitlement:', fetchError);
      setError(fetchError.message);
    }

    setEntitlement(data);
    setLoading(false);
  }

  async function createCheckoutSession() {
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase.functions.invoke('create-checkout-session', {
      body: {
        userId: user.id,
        userEmail: user.email,
      },
    });

    if (error) {
      console.error('Error creating checkout session:', error);
      throw error;
    }

    if (data?.url) {
      window.location.href = data.url;
    } else {
      throw new Error('No checkout URL returned');
    }
  }

  return {
    entitlement,
    hasAccess,
    loading,
    error,
    refresh: loadEntitlement,
    createCheckoutSession,
  };
}
