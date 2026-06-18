import axios from 'axios';

// ---------------------------------------------------------
// DUMMY FUNCTION: This is an example, not your actual logic
// ---------------------------------------------------------
export const getDummyBananaSplits = async () => {
  const response = await axios.get('https://dummyapi.com/desserts/banana-splits');
  return response.data;
};

/*
 * HOW TO USE THIS SERVICE FUNCTION IN A COMPONENT OR HOOK:
 * 
 * import { useEffect, useState } from 'react';
 * import { getDummyBananaSplits } from '../services/splits';
 * 
 * export default function BananaSplitMenu() {
 *   const [desserts, setDesserts] = useState([]);
 *   
 *   useEffect(() => {
 *     const fetchData = async () => {
 *       try {
 *         // Call the service function
 *         const data = await getDummyBananaSplits();
 *         setDesserts(data);
 *       } catch (error) {
 *         console.error("Failed to fetch desserts", error);
 *       }
 *     };
 *     
 *     fetchData();
 *   }, []); // Empty array means this runs once on mount
 *   
 *   return (
 *     <div>
 *       {desserts.length === 0 ? "Loading..." : `Found ${desserts.length} desserts`}
 *     </div>
 *   );
 * }
 */


// import { api } from './api';
// import type { Split } from '../types';

// export const getSplits = async () => {
//   // Notice we don't need the API_URL anymore, just the specific route!
//   const response = await api.get('/splits'); 
//   return response.data as Split[];
// };
