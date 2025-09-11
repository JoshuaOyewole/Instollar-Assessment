import RegisterForm from '@/components/Register';
import { Suspense } from 'react';

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    }>
      <RegisterForm />
    </Suspense>
  );
}
