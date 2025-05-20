'use client'

import { useEffect, useState } from 'react'
import { GoogleAnalytics } from '@next/third-parties/google'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Check, X } from 'lucide-react'
import { usePageLoading } from '@/app/contexts/page-loading-context'

const GTM_ID_FALLBACK = "G-PSBBEE3VYF"; // The ID user provided
// Use environment variable with a fallback for safety
const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || GTM_ID_FALLBACK;

export function CookieConsent() {
  // 'pending_local_storage': Initial state before localStorage is checked.
  // 'pending_user_action': localStorage checked, no consent found, user needs to act.
  // 'granted': User has granted consent.
  // 'denied': User has denied consent.
  const [consentStatus, setConsentStatus] = useState<'granted' | 'denied' | 'pending_local_storage' | 'pending_user_action'>('pending_local_storage');
  const { isPageLoading } = usePageLoading();

  useEffect(() => {
    // This effect runs once on the client after initial hydration to check localStorage.
    const storedConsent = localStorage.getItem('cookie_consent');
    if (storedConsent === 'granted') {
      setConsentStatus('granted');
    } else if (storedConsent === 'denied') {
      setConsentStatus('denied');
    } else {
      setConsentStatus('pending_user_action'); // No consent explicitly stored, user needs to decide.
    }
  }, []); // Empty dependency array ensures this runs once client-side

  const handleAccept = () => {
    localStorage.setItem('cookie_consent', 'granted');
    setConsentStatus('granted');
  };

  const handleDecline = () => {
    localStorage.setItem('cookie_consent', 'denied');
    setConsentStatus('denied');
  };

  // Determine if the banner should be shown
  const shouldShowBanner = !isPageLoading && consentStatus === 'pending_user_action';

  // Avoid rendering anything if the page is loading and we haven't checked localStorage yet.
  // This prevents a flash of the banner or incorrect state before client-side effects run.
  if (isPageLoading && consentStatus === 'pending_local_storage') {
    return null;
  }

  return (
    <>
      {/* Render Google Analytics script if consent has been granted and ID is available */}
      {consentStatus === 'granted' && GA_MEASUREMENT_ID && <GoogleAnalytics gaId={GA_MEASUREMENT_ID} />}
      
      {shouldShowBanner && (
        <div className="fixed bottom-0 left-0 right-0 z-[100] p-4 flex justify-center items-end animate-slideInUp">
          <Card className="w-full max-w-lg shadow-2xl bg-background/90 backdrop-blur-sm border-border">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">We Value Your Privacy</CardTitle>
              <CardDescription className="text-sm text-muted-foreground">
                We use cookies to enhance your browsing experience and analyze site traffic.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                By clicking &quot;Accept&quot;, you consent to our use of cookies for analytics. You can decline non-essential cookies.
              </p>
            </CardContent>
            <CardFooter className="flex flex-col space-y-2 sm:space-y-0 sm:flex-row sm:justify-end sm:gap-3 pt-4">
              <Button
                variant="outline"
                onClick={handleDecline}
                className="w-full sm:w-auto"
              >
                <X className="mr-2 h-4 w-4" />
                Decline
              </Button>
              <Button
                onClick={handleAccept}
                className="w-full sm:w-auto" // Rely on default Button styling or specify primary variant
              >
                <Check className="mr-2 h-4 w-4" />
                Accept
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}
    </>
  );
} 