import axios from 'axios';

// ---------------------------------------------------------
// DUMMY FUNCTION: This is an example, not your actual logic
// ---------------------------------------------------------
export const getDummyPizzaToppings = async () => {
  const response = await axios.get('https://dummyapi.com/pizza/toppings');
  return response.data;
};

/*
 * HOW TO USE THIS SERVICE FUNCTION IN A COMPONENT OR HOOK:
 * 
 * import { useEffect, useState } from 'react';
 * import { getDummyPizzaToppings } from '../services/exercises';
 * 
 * export default function PizzaToppingsComponent() {
 *   const [toppings, setToppings] = useState([]);
 *   
 *   useEffect(() => {
 *     const fetchData = async () => {
 *       try {
 *         // Call the service function
 *         const data = await getDummyPizzaToppings();
 *         setToppings(data);
 *       } catch (error) {
 *         console.error("Failed to fetch toppings", error);
 *       }
 *     };
 *     
 *     fetchData();
 *   }, []); // Empty array means this runs once on mount
 *   
 *   return (
 *     <ul>
 *       {toppings.map((topping, idx) => <li key={idx}>{topping}</li>)}
 *     </ul>
 *   );
 * }
 */
