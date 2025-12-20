import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';

/**
 * OAuth Callback Page
 * This page handles OAuth redirects from social media platforms
 * It shows a loading state and then redirects to the social accounts page
 */
export default function OAuthCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    // Check for success/error in URL params
    const success = searchParams.get('success');
    const error = searchParams.get('error');
    const accountId = searchParams.get('accountId');

    // Small delay to show the status message
    const timer = setTimeout(() => {
      if (success) {
        // Redirect to social accounts page with success indicator
        navigate(`/social-accounts?success=true&accountId=${accountId || ''}`);
      } else if (error) {
        // Redirect with error
        navigate(`/social-accounts?error=${encodeURIComponent(error)}`);
      } else {
        // Default redirect if no params
        navigate('/social-accounts');
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [searchParams, navigate]);

  const success = searchParams.get('success');
  const error = searchParams.get('error');

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        {success ? (
          <>
            <CheckCircle className="mx-auto h-16 w-16 text-green-600 mb-4" />
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Connection Successful!</h2>
            <p className="text-gray-600">Redirecting to social accounts...</p>
          </>
        ) : error ? (
          <>
            <XCircle className="mx-auto h-16 w-16 text-red-600 mb-4" />
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Connection Failed</h2>
            <p className="text-gray-600">{decodeURIComponent(error)}</p>
            <p className="text-sm text-gray-500 mt-2">Redirecting...</p>
          </>
        ) : (
          <>
            <Loader2 className="mx-auto h-16 w-16 text-blue-600 mb-4 animate-spin" />
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Processing Connection...</h2>
            <p className="text-gray-600">Please wait while we complete the setup</p>
          </>
        )}
      </div>
    </div>
  );
}

