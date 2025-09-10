import { headers } from 'next/headers';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'talent' | 'admin';
}

export async function getServerUser(): Promise<User | null> {
  try {
    const headersList = await headers();
    const userDataHeader = headersList.get('x-user-data');
    
    if (userDataHeader) {
      return JSON.parse(userDataHeader);
    }
    
    return null;
  } catch (error) {
    console.error('Error getting server user:', error);
    return null;
  }
}
