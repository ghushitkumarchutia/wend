import { useState, useEffect } from 'react';
import { signIn } from '@/lib/auth-client';
import { useRouter, Link } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { GoogleSignInButton } from './google-sign-in-button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';

import image1 from '@/assets/images/auth/image1.jpg';
import image2 from '@/assets/images/auth/image2.jpg';
import image3 from '@/assets/images/auth/image3.jpg';
import image4 from '@/assets/images/auth/image4.jpg';
import image5 from '@/assets/images/auth/image5.jpg';

const CAROUSEL_SLIDES = [
  {
    image: image1,
    title: 'Every Journey Begins Together',
    description:
      'Plan itineraries, organize every detail, and keep your entire group aligned—from the first idea to the final destination.',
  },
  {
    image: image2,
    title: 'Discover Uncharted Paths',
    description:
      'Explore local secrets, find hidden gems, and curate unique experiences for your travel companions.',
  },
  {
    image: image3,
    title: 'Seamless Group Budgeting',
    description:
      'Track shared expenses, settle bills easily, and split costs fairly without the awkward conversations.',
  },
  {
    image: image4,
    title: 'Collaborate in Real-Time',
    description:
      'Co-create itineraries together, vote on activities, and stay synced with instant group notifications.',
  },
  {
    image: image5,
    title: 'Capture Lifelong Memories',
    description:
      'Share photos, document travel logs, and compile your memories in a beautiful, unified workspace.',
  },
];

const slides = [
  CAROUSEL_SLIDES[CAROUSEL_SLIDES.length - 1],
  ...CAROUSEL_SLIDES,
  CAROUSEL_SLIDES[0],
];

export function SignInForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(1);
  const [isTransitioning, setIsTransitioning] = useState(true);
  const [activeTextSlide, setActiveTextSlide] = useState(0);
  const [autoplayDelay, setAutoplayDelay] = useState(5000);
  const router = useRouter();

  useEffect(() => {
    const timer = setInterval(() => {
      setIsTransitioning(true);
      setCurrentIndex((prev) => prev + 1);
    }, autoplayDelay);
    return () => clearInterval(timer);
  }, [autoplayDelay]);

  const handleTransitionEnd = () => {
    if (currentIndex >= CAROUSEL_SLIDES.length + 1) {
      setIsTransitioning(false);
      setCurrentIndex(1);
      setActiveTextSlide(0);
    } else if (currentIndex <= 0) {
      setIsTransitioning(false);
      setCurrentIndex(CAROUSEL_SLIDES.length);
      setActiveTextSlide(CAROUSEL_SLIDES.length - 1);
    } else {
      setActiveTextSlide(currentIndex - 1);
    }
  };

  const handleDotClick = (dotIndex: number) => {
    setIsTransitioning(true);
    setCurrentIndex(dotIndex + 1);
    setAutoplayDelay((prev) => prev + 1);
  };

  const activeDot =
    currentIndex === 0
      ? CAROUSEL_SLIDES.length - 1
      : currentIndex === CAROUSEL_SLIDES.length + 1
        ? 0
        : currentIndex - 1;

  const handleSubmit = async (e: React.FormEvent | React.MouseEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error: authError } = await signIn.email({ email, password });

      if (authError) {
        setError(authError.message || 'Invalid email or password.');
        setLoading(false);
      } else {
        router.navigate({ to: '/dashboard' });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred.';
      setError(errorMessage);
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen w-full overflow-x-hidden bg-white text-left">
      <style>{`
        input:-webkit-autofill,
        input:-webkit-autofill:hover,
        input:-webkit-autofill:focus,
        input:-webkit-autofill:active {
          -webkit-box-shadow: 0 0 0 1000px white inset !important;
          -webkit-text-fill-color: #171717 !important;
          transition: background-color 5000s ease-in-out 0s;
        }
      `}</style>
      <div className="w-full md:w-[50%] lg:w-[55%] xl:w-[60%] relative overflow-hidden h-[340px] sm:h-[400px] md:h-screen sticky md:top-0">
        <div
          className={`flex h-full w-full ${
            isTransitioning ? 'transition-transform duration-1000 ease-in-out' : 'transition-none'
          } will-change-transform`}
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
          onTransitionEnd={handleTransitionEnd}
        >
          {slides.map((slide, index) => (
            <div key={index} className="w-full h-full shrink-0 relative">
              <img
                src={slide.image}
                alt=""
                className="w-full h-full object-cover"
                loading={index === 1 ? 'eager' : 'lazy'}
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/85 via-black/40 to-black/10" />
            </div>
          ))}
        </div>

        <div className="absolute inset-0 z-20 pointer-events-none flex flex-col justify-end p-8 sm:p-12">
          <div className="text-white flex flex-col gap-2.5 text-left pointer-events-auto relative min-h-[140px] justify-end">
            <div className="relative w-full h-[80px] overflow-visible">
              {CAROUSEL_SLIDES.map((slide, index) => {
                const isActive = index === activeTextSlide;
                return (
                  <div
                    key={index}
                    className={`absolute bottom-0 left-0 w-full transition-opacity duration-500 ease-in-out ${
                      isActive ? 'opacity-100' : 'opacity-0 pointer-events-none'
                    }`}
                  >
                    <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-white leading-tight max-w-lg">
                      {slide.title}
                    </h2>
                    <p className="mt-2 text-xs sm:text-sm text-neutral-200/90 leading-relaxed font-light max-w-md">
                      {slide.description}
                    </p>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center gap-1.5 mt-4 z-30">
              {CAROUSEL_SLIDES.map((_, dotIndex) => {
                const isActive = dotIndex === activeDot;
                return (
                  <button
                    key={dotIndex}
                    type="button"
                    onClick={() => handleDotClick(dotIndex)}
                    className={`h-1 transition-all duration-300 cursor-pointer rounded-full ${
                      isActive ? 'w-3.5 bg-white' : 'w-1 bg-white/40 hover:bg-white/60'
                    }`}
                    aria-label={`Go to slide ${dotIndex + 1}`}
                  />
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="w-full md:w-[50%] lg:w-[45%] xl:w-[40%] flex items-center justify-center p-4 sm:p-12 md:p-16 lg:p-20 xl:p-24 bg-white md:h-screen overflow-y-auto">
        <div className="w-full max-w-[320px] sm:max-w-[400px] mx-auto flex flex-col justify-center">
          <Card className="border-none shadow-none ring-0 bg-transparent p-0">
            <CardHeader className="p-0 pb-6 text-center">
              <CardTitle className="text-2xl md:text-3xl font-black tracking-tight text-neutral-950 mb-1.5 font-sans">
                Wend.com
              </CardTitle>
              <CardDescription className="text-base md:text-lg font-bold text-neutral-800 tracking-tight">
                Sign In
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <Label
                    htmlFor="email"
                    className="text-xs font-semibold uppercase tracking-wider text-neutral-600"
                  >
                    Email
                  </Label>
                  <div className="relative flex items-center bg-white border border-neutral-200 rounded-xl overflow-hidden focus-within:border-[#09a474] focus-within:hover:border-[#09a474] hover:border-neutral-300 transition-all duration-200">
                    <Mail className="absolute left-3.5 h-4.5 w-4.5 text-neutral-400 pointer-events-none" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="m@example.com"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-10 md:h-11 pl-10 pr-4 py-2 border-none bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none outline-none focus:outline-none w-full text-sm"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between items-center">
                    <Label
                      htmlFor="password"
                      className="text-xs font-semibold uppercase tracking-wider text-neutral-600"
                    >
                      Password
                    </Label>
                    <Link
                      to="/forgot-password"
                      className="text-xs font-medium text-[#09a474] hover:text-[#088f65] hover:underline transition-colors"
                    >
                      Forgot your password?
                    </Link>
                  </div>
                  <div className="relative flex items-center bg-white border border-neutral-200 rounded-xl overflow-hidden focus-within:border-[#09a474] focus-within:hover:border-[#09a474] hover:border-neutral-300 transition-all duration-200">
                    <Lock className="absolute left-3.5 h-4.5 w-4.5 text-neutral-400 pointer-events-none" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="************"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-10 md:h-11 pl-10 pr-10 py-2 border-none bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none outline-none focus:outline-none w-full text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 text-neutral-400 hover:text-neutral-600 transition-colors cursor-pointer outline-none focus:outline-none"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4.5 w-4.5" />
                      ) : (
                        <Eye className="h-4.5 w-4.5" />
                      )}
                    </button>
                  </div>
                </div>

                {error && (
                  <Alert
                    variant="destructive"
                    className="rounded-xl border-red-100 bg-red-50/50 py-3 text-left"
                  >
                    <AlertDescription className="text-xs text-red-700 leading-normal">
                      {error}
                    </AlertDescription>
                  </Alert>
                )}

                <Button
                  type="submit"
                  className="w-full h-10 md:h-11 mt-2 inline-flex items-center justify-center rounded-xl bg-[#09a474] hover:bg-[#088f65] active:scale-[0.99] text-white font-semibold text-sm transition-all duration-200 shadow-md shadow-emerald-700/10 cursor-pointer border-none outline-none focus-visible:ring-2 focus-visible:ring-[#09a474]/55 disabled:opacity-60 disabled:cursor-not-allowed"
                  disabled={loading}
                >
                  {loading ? 'Signing in...' : 'Sign in'}
                </Button>

                <div className="relative my-2 flex items-center justify-center">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-neutral-100" />
                  </div>
                  <span className="relative z-10 bg-white px-3.5 text-xs font-semibold uppercase tracking-wider text-neutral-400/80">
                    OR
                  </span>
                </div>

                <div className="w-full">
                  <GoogleSignInButton
                    disabled={loading}
                    className="w-full h-10 md:h-11 rounded-xl border border-neutral-200 hover:bg-neutral-50 hover:text-neutral-900 transition-all duration-200 cursor-pointer font-medium"
                  />
                </div>
              </form>
            </CardContent>
            <CardFooter className="p-0 pt-6">
              <div className="w-full text-center text-sm text-neutral-500 font-light leading-relaxed">
                Don&apos;t have an account?{' '}
                <Link
                  to="/sign-up"
                  className="font-medium text-[#09a474] hover:text-[#088f65] hover:underline underline-offset-4 decoration-[#09a474]/30 hover:decoration-[#09a474] transition-colors"
                >
                  Sign up
                </Link>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
