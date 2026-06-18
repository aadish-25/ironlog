import axios from 'axios';

// ---------------------------------------------------------
// DUMMY FUNCTION: This is an example, not your actual logic
// ---------------------------------------------------------
export const fetchDummyRobotStatus = async () => {
  const response = await axios.get('https://dummyapi.com/robots/status');
  return response.data;
};

/*
 * HOW TO USE THIS SERVICE FUNCTION IN A COMPONENT OR HOOK:
 * 
 * import { useEffect, useState } from 'react';
 * import { fetchDummyRobotStatus } from '../services/ai';
 * 
 * export default function RobotStatusComponent() {
 *   const [status, setStatus] = useState(null);
 *   
 *   useEffect(() => {
 *     // Call the service function
 *     fetchDummyRobotStatus()
 *       .then((data) => {
 *         setStatus(data);
 *       })
 *       .catch((error) => {
 *         console.error("Failed to fetch robot status", error);
 *       });
 *   }, []); // Empty array means this runs once on mount
 *   
 *   return <div>{status ? `Robot is ${status}` : "Loading status..."}</div>;
 * }
 */
