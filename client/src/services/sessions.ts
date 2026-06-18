import axios from 'axios';

// ---------------------------------------------------------
// DUMMY FUNCTION: This is an example, not your actual logic
// ---------------------------------------------------------
export const startDummyMovieSession = async (movieId: string) => {
  const response = await axios.post('https://dummyapi.com/movies/start', { movieId });
  return response.data;
};

/*
 * HOW TO USE THIS SERVICE FUNCTION IN A COMPONENT OR HOOK:
 * 
 * import { useState } from 'react';
 * import { startDummyMovieSession } from '../services/sessions';
 * 
 * export default function StartMovieButton() {
 *   const [isStarting, setIsStarting] = useState(false);
 *   
 *   const handleStart = async () => {
 *     setIsStarting(true);
 *     try {
 *       // Call the service function and pass data
 *       const result = await startDummyMovieSession("movie-123");
 *       console.log("Movie started successfully", result);
 *     } catch (error) {
 *       console.error("Failed to start movie", error);
 *     } finally {
 *       setIsStarting(false);
 *     }
 *   };
 *   
 *   return (
 *     <button onClick={handleStart} disabled={isStarting}>
 *       {isStarting ? "Starting..." : "Start Movie"}
 *     </button>
 *   );
 * }
 */
