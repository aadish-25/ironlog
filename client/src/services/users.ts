import axios from 'axios';

// ---------------------------------------------------------
// DUMMY FUNCTION: This is an example, not your actual logic
// ---------------------------------------------------------
export const fetchDummyAlienProfile = async (alienId: string) => {
  const response = await axios.get(`https://dummyapi.com/aliens/${alienId}`);
  return response.data;
};

/*
 * HOW TO USE THIS SERVICE FUNCTION IN A COMPONENT OR HOOK:
 * 
 * import { useEffect, useState } from 'react';
 * import { fetchDummyAlienProfile } from '../services/users';
 * 
 * export default function AlienProfileViewer({ alienId }) {
 *   const [profile, setProfile] = useState(null);
 *   
 *   useEffect(() => {
 *     // Only fetch if we have an ID
 *     if (!alienId) return;
 *     
 *     const fetchProfile = async () => {
 *       try {
 *         // Call the service function with a parameter
 *         const data = await fetchDummyAlienProfile(alienId);
 *         setProfile(data);
 *       } catch (error) {
 *         console.error("Failed to fetch alien profile", error);
 *       }
 *     };
 *     
 *     fetchProfile();
 *   }, [alienId]); // Run this effect again if alienId changes
 *   
 *   return <div>{profile ? `Alien Name: ${profile.name}` : "Scanning for alien..."}</div>;
 * }
 */
