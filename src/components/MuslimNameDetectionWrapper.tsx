import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import MuslimNamePopup from '@/components/MuslimNamePopup';
import { isMuslimName } from '@/utils/muslimNames';
import { supabase } from '@/integrations/supabase/client';

const MuslimNameDetectionWrapper = () => {
  const { user } = useAuth();
  const [showMuslimPopup, setShowMuslimPopup] = useState(false);
  const [detectedUserName, setDetectedUserName] = useState('');
  
  useEffect(() => {
    const checkMuslimNameAndShowPopup = async () => {
      // Check if there's a recently registered user with a Muslim name
      const newUserWithMuslimName = localStorage.getItem('newUserWithMuslimName');
      if (newUserWithMuslimName) {
        try {
          const userData = JSON.parse(newUserWithMuslimName);
          const currentTime = Date.now();
          
          // Check if the data is still fresh (less than 5 minutes old)
          if (currentTime - userData.timestamp < 5 * 60 * 1000) {
            // This is a new user with a Muslim name
            setDetectedUserName(userData.fullName.split(' ')[0] || userData.fullName); // Just the first name
            setShowMuslimPopup(true);
            // Remove the data after using it
            localStorage.removeItem('newUserWithMuslimName');
            return; // Exit early as we've handled the new user case
          }
        } catch (e) {
          console.error('Error parsing new user data:', e);
        }
      }
      
      // Check existing user's name
      if (user) {
        // Check if we've already shown the popup for this user
        const popupShownKey = `muslim_popup_shown_${user.id}`;
        const hasPopupBeenShown = localStorage.getItem(popupShownKey);
        
        if (hasPopupBeenShown) {
          // Popup was already shown, don't show again
          return;
        }
        
        // Get user's full name from user metadata or profile
        let fullName = user.user_metadata?.full_name;
        
        // If full name is not in user metadata, fetch from profiles table
        if (!fullName) {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', user.id)
            .single();
          
          if (profileData?.full_name) {
            fullName = profileData.full_name;
          }
        }
        
        // If we have a full name, check if it's a Muslim name
        if (fullName && isMuslimName(fullName)) {
          setDetectedUserName(fullName.split(' ')[0] || fullName); // Just the first name
          setShowMuslimPopup(true);
        }
      }
    };

    // Only check when user object becomes available (after sign-in)
    if ((user || localStorage.getItem('newUserWithMuslimName')) && !showMuslimPopup) {
      checkMuslimNameAndShowPopup();
    }
  }, [user, showMuslimPopup]);

  const handleJoinTelegram = () => {
    // Open the Telegram group in a new tab/window
    window.open('https://t.me/muslim_student_group', '_blank', 'noopener,noreferrer');
    // Mark that the popup has been shown for this user
    if (user) {
      const popupShownKey = `muslim_popup_shown_${user.id}`;
      localStorage.setItem(popupShownKey, 'true');
    }
    setShowMuslimPopup(false);
  };

  const handleClosePopup = () => {
    // Mark that the popup has been shown for this user (even if they decline)
    if (user) {
      const popupShownKey = `muslim_popup_shown_${user.id}`;
      localStorage.setItem(popupShownKey, 'true');
    }
    setShowMuslimPopup(false);
  };

  return (
    <MuslimNamePopup 
      isOpen={showMuslimPopup} 
      onClose={handleClosePopup}
      onJoin={handleJoinTelegram}
      userName={detectedUserName}
    />
  );
};

export default MuslimNameDetectionWrapper;