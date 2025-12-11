import { useEffect, useState, useCallback, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { getStateImages, stateImages } from "./images";

const config = {
  API_HOST: "https://pluto-hotel-server-15c83810c41c.herokuapp.com",
};

// Helper function to parse HTML content like in PlutoToursPDF
const parseHtmlContent = (htmlString) => {
  if (!htmlString) return [];
  
  // Extract list items from ol/ul tags
  const listItemRegex = /<li[^>]*>(.*?)<\/li>/gs;
  const matches = [...htmlString.matchAll(listItemRegex)];
  
  if (matches.length === 0) {
    // If no list items found, try paragraph parsing as fallback
    return htmlString
      .replace(/<p>/g, "")
      .split("</p>")
      .map((item) => decodeHtmlEntities(item))
      .filter((item) => item && item.length > 0);
  }
  
  return matches.map(match => decodeHtmlEntities(match[1]));
};

const decodeHtmlEntities = (text) => {
  if (!text) return "";
  return text
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/<[^>]*>/g, "")
    .trim();
};

const formatInclusionExclusionText = (text) => {
  if (!text) return "";
  let formatted = text.trim();
  formatted = formatted.replace(/[.,;:!?]+$/, "");
  if (formatted.length > 0) {
    formatted += ".";
  }
  return formatted;
};

// Helper function to parse package description HTML
const parsePackageDescription = (htmlString) => {
  if (!htmlString) return [];
  
  // Extract paragraphs
  const paragraphRegex = /<p[^>]*>(.*?)<\/p>/gs;
  const matches = [...htmlString.matchAll(paragraphRegex)];
  
  if (matches.length === 0) {
    return [];
  }
  
  return matches.map(match => {
    // Remove span tags and decode HTML entities
    let text = match[1];
    text = text.replace(/<span[^>]*>/g, "");
    text = text.replace(/<\/span>/g, "");
    return decodeHtmlEntities(text);
  }).filter(text => text && text.trim().length > 0);
};

// Helper function to get hotel image URL (same as PlutoToursPDF)
const getHotelImageUrl = (hotel) => {
  if (!hotel) {
    return null;
  }
  
  // Check if propertyphoto is an array with items
  if (Array.isArray(hotel.propertyphoto) && hotel.propertyphoto.length > 0) {
    const firstImage = hotel.propertyphoto[0];
    if (firstImage && typeof firstImage === "string" && firstImage.trim()) {
      return firstImage;
    }
  }
  
  // Check if propertyphoto is a string
  if (typeof hotel.propertyphoto === "string" && hotel.propertyphoto.trim()) {
    return hotel.propertyphoto;
  }
  
  // Fallback to roomimage
  if (hotel.roomimage && typeof hotel.roomimage === "string" && hotel.roomimage.trim()) {
    return hotel.roomimage;
  }
  
  return null;
};

// Helper function to get proxied image URL for CORS issues (Firebase Storage)
const getProxiedImageUrl = (imageUrl) => {
  if (!imageUrl) return null;
  
  // For Firebase Storage URLs, use a CORS proxy
  if (imageUrl.includes('firebasestorage.googleapis.com')) {
    try {
      const sanitizedUrl = imageUrl.replace(/^https?:\/\//, "");
      // Use weserv.nl proxy (same as PlutoToursPDF)
      return `https://images.weserv.nl/?url=${encodeURIComponent(`ssl:${sanitizedUrl}`)}&output=webp`;
    } catch (error) {
      console.warn("Error creating proxied URL:", error);
    }
  }
  
  // For other URLs, try to use proxy as well
  try {
    const sanitizedUrl = imageUrl.replace(/^https?:\/\//, "");
    return `https://images.weserv.nl/?url=${encodeURIComponent(`ssl:${sanitizedUrl}`)}&output=webp`;
  } catch (error) {
    return imageUrl; // Fallback to original URL
  }
};

// Reusable Image Scroller Component with Thumbnails
const ImageScroller = ({ images, title, subtitle }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showThumbnails, setShowThumbnails] = useState(true);

  if (!images || images.length === 0) return null;

  const totalImages = images.length;
  const visibleThumbnails = 3;
  const remainingCount = Math.max(0, totalImages - visibleThumbnails);

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? totalImages - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === totalImages - 1 ? 0 : prev + 1));
  };

  const goToImage = (index) => {
    setCurrentIndex(index);
  };

  return (
    <div className="w-full mb-6 md:mb-8">
      {/* Main Image Display */}
      <div className="relative w-full rounded-lg overflow-hidden" style={{ minHeight: '400px', maxHeight: '600px' }}>
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center transition-all duration-500"
          style={{
            backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3)), url(${images[currentIndex]})`,
          }}
        >
          {/* Overlay Text */}
          {(title || subtitle) && (
            <div className="absolute inset-0 flex flex-col justify-center items-center text-center px-4 z-10">
              {subtitle && (
                <span className="text-orange-400 text-xl sm:text-2xl md:text-3xl font-serif italic mb-2">
                  {subtitle}
                </span>
              )}
              {title && (
                <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white uppercase">
                  {title}
                </h2>
              )}
            </div>
          )}

          {/* Navigation Arrows */}
          {totalImages > 1 && (
            <>
              <button
                onClick={goToPrevious}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-white/90 hover:bg-white rounded-full p-2 sm:p-3 shadow-lg transition-all"
                aria-label="Previous image"
              >
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={goToNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-white/90 hover:bg-white rounded-full p-2 sm:p-3 shadow-lg transition-all"
                aria-label="Next image"
              >
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}

          {/* Image Indicators */}
          {totalImages > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
              {/* Indicator Dots */}
              <div className="flex items-center gap-1.5">
                {Array.from({ length: Math.min(totalImages, 5) }).map((_, idx) => {
                  const dotIndex = currentIndex < 3 ? idx : currentIndex - 2 + idx;
                  if (dotIndex >= totalImages) return null;
                  return (
                    <button
                      key={idx}
                      onClick={() => goToImage(dotIndex)}
                      className={`w-2 h-2 rounded-full transition-all ${
                        dotIndex === currentIndex
                          ? 'bg-gray-800 w-8'
                          : 'bg-gray-300 hover:bg-gray-400'
                      }`}
                      aria-label={`Go to image ${dotIndex + 1}`}
                    />
                  );
                })}
              </div>
              {/* Current/Total Counter */}
              <span className="text-white text-sm sm:text-base font-medium bg-black/50 px-2 py-1 rounded">
                {currentIndex + 1}/{totalImages}
              </span>
            </div>
          )}
        </div>

        {/* Thumbnail Gallery - Desktop View */}
        {totalImages > 1 && (
          <div className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 flex-col gap-2 z-20 max-h-[400px] overflow-y-auto pr-2" style={{ scrollbarWidth: 'thin' }}>
            {images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => goToImage(idx)}
                className={`w-16 h-16 rounded-full overflow-hidden border-2 transition-all flex-shrink-0 ${
                  currentIndex === idx
                    ? 'border-yellow-400 ring-2 ring-yellow-400 ring-offset-2 scale-110'
                    : 'border-white/50 hover:border-white hover:scale-105'
                }`}
              >
                <img
                  src={img}
                  alt={`Thumbnail ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Thumbnail Gallery - Mobile View (Horizontal Scroll) */}
      {totalImages > 1 && (
        <div className="md:hidden mt-4">
          <div className="flex gap-2 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            {images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => goToImage(idx)}
                className={`flex-shrink-0 w-16 h-16 rounded-full overflow-hidden border-2 transition-all ${
                  currentIndex === idx
                    ? 'border-yellow-400 ring-2 ring-yellow-400'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <img
                  src={img}
                  alt={`Thumbnail ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
          <style>{`
            div[style*="scrollbarWidth"]::-webkit-scrollbar {
              display: none;
            }
          `}</style>
        </div>
      )}
    </div>
  );
};

const PlutoLink = () => {
  const [searchParams] = useSearchParams();
  const [packageData, setPackageData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("itinerary");
  const [destinationImages, setDestinationImages] = useState([]);
  const [cabImages, setCabImages] = useState([]);
  const [cabImageCache, setCabImageCache] = useState({});
  const imageScrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [reviews, setReviews] = useState([]);
  const [placePhotos, setPlacePhotos] = useState([]);
  const reviewsScrollRef = useRef(null);
 
  const id = searchParams.get("id"); // This is now the historyId
  const placeId = "ChIJGUURbYt_BTkRBL7H7m91Z90";

  useEffect(() => {
    const fetchReviews = async () => {
      try {
          const response = await fetch(
          `${config.API_HOST}/api/places/google-reviews/${placeId}`
        );
        const data = await response.json();
  
        
        // Check if success is true and reviews exist
        if (data.success && data.reviews && Array.isArray(data.reviews)) {
        
          
          // Store place photos if available
          if (data.placePhotos && Array.isArray(data.placePhotos) && data.placePhotos.length > 0) {
            setPlacePhotos(data.placePhotos);
          }
          
          // Filter reviews with rating > 3
          const filteredReviews = data.reviews.filter(review => review.rating > 3);
          setReviews(filteredReviews);
        } else if (data.reviews && Array.isArray(data.reviews)) {
          // Fallback: if reviews exist
          if (data.placePhotos && Array.isArray(data.placePhotos) && data.placePhotos.length > 0) {
            setPlacePhotos(data.placePhotos);
          }
          const filteredReviews = data.reviews.filter(review => review.rating > 3);
          setReviews(filteredReviews);
        }
      } catch (error) {
        console.error("Error fetching reviews:", error);
      }
    };
    fetchReviews();
  }, [placeId]);
  // Fetch cab images
  useEffect(() => {
    const fetchCabImages = async () => {
      try {
        const response = await fetch(`${config.API_HOST}/api/cabs/getcabsminimal`);
        if (response.ok) {
          const data = await response.json();
          setCabImages(data?.result || []);
        }
      } catch (err) {
        console.error("Error fetching cab images:", err);
      }
    };
    fetchCabImages();
  }, []);

  // Find cab image by matching cabName or cabType
  const findCabImage = useCallback((cabName, cabType) => {
    if (!cabImages || !Array.isArray(cabImages) || cabImages.length === 0) {
      return null;
    }

    const normalizedCabName = (cabName || "").toLowerCase().trim();
    const normalizedCabType = (cabType || "").toLowerCase().trim();

    // First, try to match by cabName
    if (normalizedCabName) {
      const nameMatch = cabImages.find((cab) => {
        const normalizedImageCabName = (cab.cabName || "").toLowerCase().trim();
        
        if (normalizedImageCabName === normalizedCabName) {
          return true;
        }
        
        if (normalizedImageCabName.includes(normalizedCabName) || 
            normalizedCabName.includes(normalizedImageCabName)) {
          return true;
        }
        
        const historyWords = normalizedCabName.split(/\s+/);
        const imageWords = normalizedImageCabName.split(/\s+/);
        
        return historyWords.some(word => 
          word.length > 2 && imageWords.some(imgWord => 
            imgWord.includes(word) || word.includes(imgWord)
          )
        );
      });

      if (nameMatch && nameMatch.cabImages && nameMatch.cabImages.length > 0) {
        return nameMatch.cabImages[0];
      }
    }

    // If no name match, try to match by cabType
    if (normalizedCabType) {
      const typeMatch = cabImages.find((cab) => {
        const normalizedImageCabType = (cab.cabType || "").toLowerCase().trim();
        return normalizedImageCabType === normalizedCabType;
      });

      if (typeMatch && typeMatch.cabImages && typeMatch.cabImages.length > 0) {
        return typeMatch.cabImages[0];
      }
    }

    return null;
  }, [cabImages]);

  useEffect(() => {
    const fetchPackageData = async () => {
      // Since API now fetches by historyId directly, we only need id (which is the historyId)
      if (!id) {
        setError("Missing required parameter: id");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        // Fixed double slash and use id (which is the historyId)
        const response = await fetch(
          `${config.API_HOST}/api/finalcosting/get-by-id/${id}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch package data");
        }

        const data = await response.json();
        console.log(data, "data");
        if (data) {
          // API now returns a single object directly, not an array
          setPackageData(data);
          
          // Get destination images
          const packageState = data?.transfer?.state || data?.package?.state || "";
          const stateName = findMatchingState(packageState);
          if (stateName) {
            const images = getStateImages(stateName);
            setDestinationImages(images);
          } else {
            setDestinationImages([
              "https://res.cloudinary.com/dcp1ev1uk/image/upload/v1724223741/himaclahimg2_cs0qvm.jpg",
              "https://res.cloudinary.com/dcp1ev1uk/image/upload/v1724223742/himaclahimg3_klatkm.jpg",
              "https://res.cloudinary.com/dcp1ev1uk/image/upload/v1724223742/himaclahimg4_ujs3z9.jpg",
            ]);
          }

          // Preload cab images
          if (data.transfer?.details && data.transfer.details.length > 0) {
            const cache = {};
            data.transfer.details.forEach((cab, index) => {
              const cabImageUrl = findCabImage(cab?.cabName, cab?.cabType);
              if (cabImageUrl) {
                cache[index] = cabImageUrl;
              }
            });
            setCabImageCache(cache);
          }
        } else {
          setError("No package data found");
        }
      } catch (err) {
        console.error("Error fetching package data:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPackageData();
  }, [id, findCabImage]);

  // Check scroll position for arrow visibility
  const checkScrollPosition = useCallback(() => {
    if (imageScrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = imageScrollRef.current;
      setCanScrollLeft(scrollLeft > 5);
      // Check if there's more content to scroll (with a small buffer)
      const hasMoreContent = scrollWidth > clientWidth;
      const isAtEnd = scrollLeft >= scrollWidth - clientWidth - 5;
      setCanScrollRight(hasMoreContent && !isAtEnd);
    }
  }, []);

  // Scroll functions
  const scrollLeft = () => {
    if (imageScrollRef.current) {
      const scrollAmount = 320 + 12; // image width (w-80 = 320px) + gap (gap-3 = 12px)
      imageScrollRef.current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
      // Check position after scroll
      setTimeout(checkScrollPosition, 300);
    }
  };

  const scrollRight = () => {
    if (imageScrollRef.current) {
      const scrollAmount = 320 + 12; // image width (w-80 = 320px) + gap (gap-3 = 12px)
      imageScrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      // Check position after scroll
      setTimeout(checkScrollPosition, 300);
    }
  };

  // Check scroll position on mount and when images change
  useEffect(() => {
    // Wait for images to load before checking
    const timer = setTimeout(() => {
      checkScrollPosition();
    }, 100);
    
    const scrollContainer = imageScrollRef.current;
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', checkScrollPosition);
      window.addEventListener('resize', checkScrollPosition);
      return () => {
        clearTimeout(timer);
        scrollContainer.removeEventListener('scroll', checkScrollPosition);
        window.removeEventListener('resize', checkScrollPosition);
      };
    }
    
    return () => clearTimeout(timer);
  }, [destinationImages, checkScrollPosition]);

  const findMatchingState = (packageState) => {
    if (!packageState) return null;
    const lowerPackageState = packageState.toLowerCase();
    
    for (const stateName of Object.keys(stateImages)) {
      const lowerStateName = stateName.toLowerCase();
      if (lowerPackageState === lowerStateName || lowerPackageState.includes(lowerStateName)) {
        return stateName;
      }
    }
    
    return null;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  const formatOrdinal = (number) => {
    const n = Number(number);
    if (Number.isNaN(n)) return `${number}`;
    const remainder100 = n % 100;
    if (remainder100 >= 11 && remainder100 <= 13) {
      return `${n}th`;
    }
    switch (n % 10) {
      case 1:
        return `${n}st`;
      case 2:
        return `${n}nd`;
      case 3:
        return `${n}rd`;
      default:
        return `${n}th`;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 w-full animate-pulse">
  
        {/* TOP NAVBAR SKELETON */}
        <div className="bg-[#2b2d42] p-6">
          <div className="max-w-6xl mx-auto flex justify-between items-center">
  
            {/* Logo + text */}
            <div className="flex items-center gap-4">
              <div className="h-10 w-32 bg-gray-500 rounded"></div>
              <div className="h-4 w-28 bg-gray-500 rounded"></div>
            </div>
  
            {/* Contact buttons */}
            <div className="flex gap-4">
              <div className="h-10 w-36 bg-gray-500 rounded"></div>
              <div className="h-10 w-36 bg-gray-500 rounded"></div>
            </div>
          </div>
        </div>
  
        {/* MAIN CONTENT */}
        <div className="max-w-6xl mx-auto px-4 md:px-6 -mt-4">
  
          {/* Personalized + Title + tags + price block */}
          <div className="bg-white shadow-md rounded-lg p-6 mb-6">
  
            {/* personalized */}
            <div className="h-4 w-44 bg-gray-300 rounded mb-4"></div>
  
            {/* title */}
            <div className="h-6 w-2/3 bg-gray-300 rounded mb-4"></div>
  
            {/* Tags */}
            <div className="flex gap-3 mb-4">
              <div className="h-6 w-20 bg-gray-300 rounded"></div>
              <div className="h-6 w-24 bg-gray-300 rounded"></div>
              <div className="h-6 w-20 bg-gray-300 rounded"></div>
            </div>
  
            {/* Right side pricing */}
            <div className="flex justify-end">
              <div className="h-20 w-56 bg-gray-200 rounded-lg"></div>
            </div>
          </div>
  
          {/* IMAGE GALLERY */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <div className="h-48 bg-gray-300 rounded-lg"></div>
            <div className="h-48 bg-gray-300 rounded-lg"></div>
            <div className="h-48 bg-gray-300 rounded-lg"></div>
          </div>
  
          {/* PACKAGE OVERVIEW SECTION */}
          <div className="bg-white shadow p-6 rounded-lg">
  
            {/* Title */}
            <div className="h-6 w-48 bg-gray-300 rounded mb-6"></div>
  
            {/* Lines */}
            <div className="space-y-4">
              <div className="h-4 w-5/6 bg-gray-300 rounded"></div>
              <div className="h-4 w-4/6 bg-gray-300 rounded"></div>
              <div className="h-4 w-2/3 bg-gray-300 rounded"></div>
              <div className="h-4 w-3/4 bg-gray-300 rounded"></div>
            </div>
          </div>
  
        </div>
      </div>
    );
  }
  

  if (error || !packageData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-red-600 text-lg mb-4">Error: {error || "Package not found"}</p>
          <p className="text-gray-600">Please check the link and try again.</p>
        </div>
      </div>
    );
  }

  const packageInfo = packageData.package || {};
  const selectedLead = packageData.transfer?.selectedLead || {};
  const itineraryDays = packageInfo.itineraryDays || packageData.transfer?.itineraryDays || [];
  const hotels = packageData.hotels || [];
  const transfers = packageData.transfer?.details || [];
  const activities = packageData.activities || [];

 

  // Get package type (Family/Fixed/Customizable)
  const getPackageType = () => {
    if (packageInfo.customizablePackage) return "Customizable";
    if (selectedLead?.packageType) return selectedLead.packageType;
    return "Fixed";
  };

  // Format duration
  const formatDuration = (duration) => {
    if (!duration) return "5N/6D";
    // If duration is like "5N/6D" or "6D/5N", return as is
    if (duration.includes("N") || duration.includes("D")) return duration;
    // Otherwise format it
    return duration;
  };

  // Get hero background image (use first destination image or fallback)
  const heroBackgroundImage = destinationImages.length > 0 
    ? destinationImages[0] 
    : "https://res.cloudinary.com/dcp1ev1uk/image/upload/v1724223741/himaclahimg2_cs0qvm.jpg";

  // Parse duration to get days and nights
  const parseDuration = (duration) => {
    if (!duration) return { days: "6", nights: "5" };
    
    const durationStr = String(duration).trim();
    
    // Pattern 1: "5N/6D" or "5N / 6D" or "6D/5N"
    const pattern1 = durationStr.match(/(\d+)\s*N\s*[\/|]\s*(\d+)\s*D/i);
    if (pattern1) {
      return { nights: pattern1[1], days: pattern1[2] };
    }
    
    // Pattern 2: "6D/5N" or "6D / 5N"
    const pattern2 = durationStr.match(/(\d+)\s*D\s*[\/|]\s*(\d+)\s*N/i);
    if (pattern2) {
      return { days: pattern2[1], nights: pattern2[2] };
    }
    
    // Pattern 3: "5N 6D" (space separated)
    const pattern3 = durationStr.match(/(\d+)\s*N.*?(\d+)\s*D/i);
    if (pattern3) {
      return { nights: pattern3[1], days: pattern3[2] };
    }
    
    // Pattern 4: "6D 5N" (space separated)
    const pattern4 = durationStr.match(/(\d+)\s*D.*?(\d+)\s*N/i);
    if (pattern4) {
      return { days: pattern4[1], nights: pattern4[2] };
    }
    
    // Pattern 5: Just numbers - assume first is nights, second is days
    const numbers = durationStr.match(/\d+/g);
    if (numbers && numbers.length >= 2) {
      return { nights: numbers[0], days: numbers[1] };
    }
    
    // Default fallback
    return { days: "6", nights: "5" };
  };

  const durationInfo = parseDuration(packageInfo.duration);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation Bar */}
      <div className="bg-[#2d2d44] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-3 sm:py-4">
            {/* Logo and Company Name */}
            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
              <img
                src="https://res.cloudinary.com/dcp1ev1uk/image/upload/v1749122411/PTW_Holidays_Logo_1_mgi4uu.png"
                alt="PTW Holidays Logo"
                className="w-10 h-10 sm:w-12 sm:h-12 object-contain"
              />
              <span className="text-white text-sm sm:text-base md:text-lg font-semibold">ptwholidays.com</span>
            </div>

            {/* Right Side: Email and Phone - Stacked vertically on mobile, horizontal on larger screens */}
            <div className="flex flex-col sm:flex-row items-end sm:items-center gap-1.5 sm:gap-3 md:gap-4">
              <a
                href="mailto:info@ptwholidays.com"
                className="flex items-center gap-1.5 sm:gap-2 text-white text-xs sm:text-sm md:text-base hover:opacity-80 transition-opacity whitespace-nowrap"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span className="text-xs sm:text-sm md:text-base">info@ptwholidays.com</span>
              </a>
              <a
                href="tel:+918353056000"
                className="flex items-center gap-1.5 sm:gap-2 text-white text-xs sm:text-sm md:text-base hover:opacity-80 transition-opacity whitespace-nowrap"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span className="text-xs sm:text-sm md:text-base">+91-8353056000</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Banner Section with Background Image */}
      <div 
        className="relative w-full bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url(${heroBackgroundImage})`,
          minHeight: '400px',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
          {/* Left Side: Quotation Options Button */}
    
          {/* Main Content: Package Name and Details */}
          <div className="relative z-10 pt-16 sm:pt-20">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 lg:gap-8">
              {/* Left: Package Name Section */}
              <div className="flex-1">
                {/* Personalized for - Yellow Script Style */}
                <div className="mb-3 sm:mb-4">
                  <span className="text-yellow-400 text-xl sm:text-2xl md:text-3xl font-serif italic">
                    {selectedLead?.name || "Valued Customer"}'s
                  </span>
                </div>

                {/* Package Name - Large White Bold */}
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white mb-4 sm:mb-6 leading-tight break-words uppercase">
                  {packageInfo.packageName || "EXCLUSIVE TRAVEL PACKAGE"}
                </h1>

                {/* Duration Box and TRIP Text */}
                <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                  <div className="border-2 border-yellow-400 px-4 sm:px-6 py-2 sm:py-3 bg-transparent">
                    <span className="text-white text-base sm:text-lg md:text-xl font-semibold">
                      {durationInfo.days} Days | {durationInfo.nights} Nights
                    </span>
                  </div>
                  <span className="text-white text-2xl sm:text-3xl md:text-4xl font-bold uppercase">
                    TRIP
                  </span>
                </div>
              </div>

              {/* Right: Cost Summary Box */}
              <div className="bg-teal-500/30 backdrop-blur-sm rounded-xl p-4 sm:p-6 border-2 border-teal-400/50 w-full lg:w-auto lg:min-w-[300px] flex-shrink-0">
                <div className="flex flex-col sm:flex-row lg:flex-col items-start gap-4 mb-4">
                  <div className="flex flex-col">
                    <span className="text-white text-sm sm:text-base font-medium">Total Package Cost</span>
                    <span className="text-white/90 text-xs sm:text-sm">With 5% GST included</span>
                  </div>
                  <span className="text-white text-3xl sm:text-4xl md:text-5xl font-bold whitespace-nowrap">
                    ₹{packageData.finalTotal?.toLocaleString() || packageData.totals?.grandTotal?.toLocaleString() || "0"}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1.5 bg-white/20 rounded-lg text-white text-xs font-medium whitespace-nowrap">
                    Adults: {selectedLead?.adults || "0"}
                  </span>
                  <span className="px-3 py-1.5 bg-white/20 rounded-lg text-white text-xs font-medium whitespace-nowrap">
                    Children: {selectedLead?.kids || "0"}
                  </span>
                  <span className="px-3 py-1.5 bg-white/20 rounded-lg text-white text-xs font-medium whitespace-nowrap">
                    Extra Bed: {selectedLead?.extraBeds || "0"}
                  </span>
                  <span className="px-3 py-1.5 bg-white/20 rounded-lg text-white text-xs font-medium whitespace-nowrap">
                    Rooms: {selectedLead?.noOfRooms || "0"}
                  </span>
                </div>
                {packageData.discountPercentage > 0 && (
                  <div className="mt-3 px-3 py-1.5 bg-green-500/40 rounded-lg text-white text-xs font-medium">
                    {packageData.discountPercentage}% OFF Applied
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Image Gallery - Using ImageScroller Component */}
    

      {/* Package Description Section */}
      {packageInfo.packageDescription && (
        <div className="max-w-7xl mx-auto  sm:px-6 lg:px-8 py-4 md:py-6">
          <div className="rounded-xl border border-gray-200 p-4 sm:p-6 md:p-8">
            {/* Header with icon */}
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-gradient-to-br from-[#2d2d44] to-[#2d2d44] rounded-lg p-2 shadow-lg">
                <svg className="w-6 h-6 md:w-7 md:h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h2 className="text-xl md:text-2xl font-bold text-gray-900">Package Overview</h2>
            </div>
            
            {/* Description paragraphs */}
            <div className="space-y-2">
              {parsePackageDescription(packageInfo.packageDescription).map((paragraph, index) => (
                <div 
                  key={index} 
                  className=" rounded-lg p-2 border border-blue-200"
                >
                  <div className="flex items-start gap-2">
                    <span className="text-[#2d2d44] mt-1 flex-shrink-0 font-bold">•</span>
                    <p className="text-gray-700 text-sm md:text-base leading-relaxed flex-1">
                      {paragraph}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tabs Navigation - Responsive */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="overflow-x-auto">
          <nav className="flex space-x-2 md:space-x-3 min-w-max md:min-w-0" aria-label="Tabs">
            {[
              { id: "itinerary", label: "Itinerary" },
              { id: "summary", label: "Summary" },
              { id: "transfers", label: "Transfers" },
              { id: "stay", label: "Stay" },
              { id: "inclusions", label: "Inclusions" },
              { id: "exclusions", label: "Exclusions" },
              { id: "customExclusions", label: "Custom Exclusions" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 md:py-3 px-4 md:px-6 border-2 rounded-lg font-medium text-xs md:text-sm whitespace-nowrap transition-all ${
                  activeTab === tab.id
                    ? "border-[#2d2d44] bg-[#2d2d44] text-white shadow-md"
                    : "border-gray-300 bg-gray-100 text-gray-700 hover:bg-gray-200 hover:border-gray-400"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Tab Content - Responsive */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        {/* Image Scroller for all tabs */}
        {destinationImages.length > 0 && (
          <div className="mb-6 md:mb-8">
            <ImageScroller 
              images={destinationImages}
              title={packageInfo.packageName?.toUpperCase() || "DESTINATION"}
              subtitle={`${durationInfo.days} day${durationInfo.days !== "1" ? "s" : ""} in ${packageInfo.packageName?.split(" ")[0]?.toUpperCase() || "DESTINATION"}`}
            />
          </div>
        )}

        {activeTab === "itinerary" && (
          <ItineraryTab
            itineraryDays={itineraryDays}
            hotels={hotels}
            activities={activities}
            transfers={transfers}
            selectedLead={selectedLead}
            packageInfo={packageInfo}
            formatDate={formatDate}
            formatOrdinal={formatOrdinal}
            decodeHtmlEntities={decodeHtmlEntities}
            cabImageCache={cabImageCache}
            findCabImage={findCabImage}
          />
        )}

        {activeTab === "summary" && (
          <SummaryTab
            itineraryDays={itineraryDays}
            hotels={hotels}
            selectedLead={selectedLead}
            packageInfo={packageInfo}
            formatDate={formatDate}
            decodeHtmlEntities={decodeHtmlEntities}
          />
        )}

        {activeTab === "transfers" && (
          <TransfersTab 
            transfers={transfers} 
            selectedLead={selectedLead}
            packageInfo={packageInfo}
            cabImageCache={cabImageCache} 
            findCabImage={findCabImage} 
          />
        )}

        {activeTab === "stay" && (
          <StayTab
            hotels={hotels}
            itineraryDays={itineraryDays}
            selectedLead={selectedLead}
            packageInfo={packageInfo}
            formatDate={formatDate}
            formatOrdinal={formatOrdinal}
          />
        )}

        {activeTab === "inclusions" && (
          <div className="space-y-6 md:space-y-8">
            <InclusionsSection packageInfo={packageInfo} decodeHtmlEntities={decodeHtmlEntities} />
          </div>
        )}

        {activeTab === "exclusions" && (
          <div className="space-y-6 md:space-y-8">
            <ExclusionsSection packageInfo={packageInfo} decodeHtmlEntities={decodeHtmlEntities} showOnlyMain={true} />
          </div>
        )}

        {activeTab === "customExclusions" && (
          <div className="space-y-6 md:space-y-8">
            <CustomExclusionsSection packageInfo={packageInfo} decodeHtmlEntities={decodeHtmlEntities} />
          </div>
        )}
      </div>

      {/* Inclusions & Exclusions - Responsive - Vertical Layout - Only show when NOT on inclusions/exclusions/customExclusions tabs */}
      {(packageInfo.packageInclusions || packageInfo.packageExclusions || (packageInfo.customExclusions && packageInfo.customExclusions.length > 0)) && 
       activeTab !== "inclusions" && activeTab !== "exclusions" && activeTab !== "customExclusions" && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
          <div className="space-y-6 md:space-y-8">
            <InclusionsSection packageInfo={packageInfo} decodeHtmlEntities={decodeHtmlEntities} />
            <ExclusionsSection packageInfo={packageInfo} decodeHtmlEntities={decodeHtmlEntities} />
          </div>
        </div>
      )}

      {/* Reviews Section */}
      {reviews.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
          <ReviewsSection reviews={reviews} placePhotos={placePhotos} reviewsScrollRef={reviewsScrollRef} />
        </div>
      )}

      {/* Mission Section with Team Photo */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        <MissionSection />
      </div>

      {/* Account Details Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        <AccountDetailsSection />
      </div>

      {/* Footer - Responsive */}
      <footer className="bg-[#2d2d44] text-white py-2 mt-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-4 lg:px-5">
          <CompanyFooter />
        </div>
      </footer>
    </div>
  );
};

// Satisfaction Buttons Component
const SatisfactionButtons = ({ question, message, packageInfo, selectedLead }) => {
  const packageName = packageInfo?.packageName || "N/A";
  const customerName = selectedLead?.name || "N/A";
  const duration = packageInfo?.duration || "N/A";

  const createWhatsAppLink = (satisfied) => {
    const statusMessage = satisfied 
      ? `Customer is satisfied with ${message}`
      : `Customer is not satisfied with ${message}`;
    const text = `${statusMessage}\n\nPackage: ${packageName}\nCustomer: ${customerName}\nDuration: ${duration}`;
    return `https://wa.me/917018103686?text=${encodeURIComponent(text)}`;
  };

  return (
    <div className="mt-6 md:mt-8 pt-6 md:pt-8 border-t border-gray-200 bg-gray-50 rounded-lg p-4 md:p-6">
      <p className="text-sm md:text-base text-gray-600 mb-4 md:mb-6 text-center font-medium">
        {question}
      </p>
      <div className="flex flex-row gap-3 md:gap-4 justify-center">
        <a
          href={createWhatsAppLink(true)}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-green-500/20 hover:bg-green-500/30 px-4 md:px-6 py-2 md:py-3 rounded-lg border border-green-500/40 text-sm md:text-base font-semibold text-gray-900 transition-all duration-200 hover:shadow-md"
        >
          Yes
        </a>
        <a
          href={createWhatsAppLink(false)}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-red-500/20 hover:bg-red-500/30 px-4 md:px-6 py-2 md:py-3 rounded-lg border border-red-500/40 text-sm md:text-base font-semibold text-gray-900 transition-all duration-200 hover:shadow-md"
        >
          No
        </a>
      </div>
    </div>
  );
};

// Itinerary Tab Component - Show day-wise with cab on day 1
const ItineraryTab = ({
  itineraryDays,
  hotels,
  activities,
  transfers,
  selectedLead,
  packageInfo,
  formatDate,
  formatOrdinal,
  decodeHtmlEntities,
  cabImageCache,
  findCabImage,
}) => {
  const getHotelForDay = (dayObj) => {
    if (!dayObj || !hotels) return null;
    return hotels.find((hotel) => String(hotel.day) === String(dayObj.day));
  };

  const getActivitiesForDay = (dayNumber) => {
    if (!activities) return [];
    return activities.filter((activity) => activity.dayNumber === dayNumber);
  };

  const getTransferForDay = (dayIndex) => {
    if (dayIndex === 0 && transfers && transfers.length > 0) {
      return transfers[0];
    }
    return null;
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 md:mb-6">TRIP ITINERARY</h2>
      {itineraryDays.map((day, index) => {
        const dayData = day.selectedItinerary || {};
        const hotel = getHotelForDay(day);
        const dayActivities = getActivitiesForDay(day.day);
        const transfer = getTransferForDay(index);
        const startDate = selectedLead?.travelDate ? new Date(selectedLead.travelDate) : new Date();
        const currentDate = new Date(startDate);
        currentDate.setDate(startDate.getDate() + index);

        return (
          <div key={index} className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
            {/* Theme Color Header Section */}
            <div className="bg-[#2d2d44] px-4 md:px-6 py-4 md:py-5">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 md:gap-4">
                {/* Day Number Circle */}
                <div className="bg-white text-[#2d2d44] rounded-full w-12 h-12 md:w-14 md:h-14 flex items-center justify-center font-bold text-lg md:text-xl flex-shrink-0">
                  {String(index + 1).padStart(2, "0")}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 md:gap-3 mb-2">
                    <span className="text-white text-sm md:text-base">{formatDate(currentDate)}</span>
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 md:w-5 md:h-5 text-white flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span className="text-white text-sm md:text-base font-medium">{dayData.cityName || "Destination"}</span>
                    </div>
                  </div>
                  <h3 className="text-white text-lg md:text-xl lg:text-2xl font-bold break-words">{dayData.itineraryTitle || `Day ${index + 1}`}</h3>
                </div>
              </div>
            </div>

            <div className="px-4 md:px-6 py-4 md:py-6 space-y-3 md:space-y-4">
              {/* Show Transfer on Day 1 */}
              {index === 0 && transfer && (
                <div className=" rounded-lg p-3 md:p-4 border border-blue-200">
                  <div className="flex flex-col sm:flex-row items-start gap-3 md:gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <svg className="w-4 h-4 md:w-5 md:h-5 text-[#2d2d44]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                        </svg>
                        <h4 className="font-semibold text-gray-900 text-sm md:text-base">Private Transfer</h4>
                      </div>
                      <p className="text-sm md:text-base text-gray-700 mb-1">
                        {transfer.cabName || "Standard Vehicle"} | {transfer.cabType || "Sedan"}
                      </p>
                      <p className="text-xs md:text-sm text-gray-600">
                        {transfer.cabSeatingCapacity || "4"} Seater • {transfer.vehicleCategory || "Standard Category"}
                      </p>
                    </div>
                    {cabImageCache[0] && (
                      <div className="w-full sm:w-32 h-24 sm:h-28 rounded-lg overflow-hidden flex-shrink-0">
                        <img
                          src={cabImageCache[0]}
                          alt={transfer.cabName || "Vehicle"}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {dayData.itineraryDescription && (
                <div className="space-y-2">
                  {decodeHtmlEntities(dayData.itineraryDescription)
                    .split(/\.\s+/)
                    .filter((s) => s.trim())
                    .map((sentence, idx) => (
                      <div key={idx} className=" rounded-lg p-3 border border-blue-200">
                        <div className="flex items-start gap-2">
                          <span className="text-[#2d2d44] mt-1 flex-shrink-0 font-bold">•</span>
                          <span className="text-sm md:text-base text-gray-700 flex-1">{sentence.trim()}{sentence.trim().endsWith('.') ? '' : '.'}</span>
                        </div>
                      </div>
                    ))}
                </div>
              )}

              {dayData.cityArea && dayData.cityArea.length > 0 && (
                <div className="mt-4 md:mt-5">
                  <div className="flex items-center gap-2 mb-3">
                    <svg className="w-4 h-4 md:w-5 md:h-5 text-[#2d2d44] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <h4 className="font-semibold text-gray-900 text-sm md:text-base">PLACES TO VISIT</h4>
                  </div>
                  <div className="space-y-1.5">
                    {dayData.cityArea.map((area, areaIndex) => {
                      const areaText = typeof area === "string" ? area : area.placeName || area.city || "";
                      return (
                        <div key={areaIndex} className=" rounded-lg p-3 border border-blue-200">
                          <div className="flex items-start gap-2">
                            <span className="text-[#2d2d44] mt-1 flex-shrink-0 font-bold">•</span>
                            <span className="text-sm md:text-base text-gray-700 break-words">{decodeHtmlEntities(areaText)}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {hotel && (
                <div className="mt-4 md:mt-5 space-y-4">
                  <div className=" rounded-lg p-3 md:p-4 border border-blue-200">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">
                        {formatOrdinal(index + 1)} NIGHT
                      </span>
                      <span className="text-xs md:text-sm text-gray-600">at {hotel.cityName || hotel.hotelCity || dayData.cityName}</span>
                    </div>
                    <div className="flex flex-col sm:flex-row items-start gap-4">
                      {(() => {
                        const hotelImageUrl = getHotelImageUrl(hotel);
                        const proxiedUrl = hotelImageUrl ? getProxiedImageUrl(hotelImageUrl) : null;
                        return hotelImageUrl ? (
                          <img
                            src={proxiedUrl || hotelImageUrl}
                            alt={hotel.propertyName || "Hotel"}
                            className="w-full sm:w-32 h-24 sm:h-28 object-cover rounded-lg flex-shrink-0"
                            loading="lazy"
                            crossOrigin="anonymous"
                            onError={(e) => {
                              if (proxiedUrl && e.target.src === proxiedUrl) {
                                e.target.src = hotelImageUrl;
                                e.target.onerror = null;
                                return;
                              }
                              e.target.onerror = null;
                              e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="128" height="96"%3E%3Crect width="128" height="96" fill="%23e5e7eb"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%239ca3af" font-family="Arial" font-size="12"%3ENo Image%3C/text%3E%3C/svg%3E';
                            }}
                          />
                        ) : (
                          <div className="w-full sm:w-32 h-24 sm:h-28 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                            </svg>
                          </div>
                        );
                      })()}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-gray-900 text-base md:text-lg mb-2 break-words">{hotel.propertyName}</h4>
                        {hotel.basicInfo?.hotelStarRating && (
                          <p className="text-yellow-500 text-xs md:text-sm mb-3">
                            {"★".repeat(Math.round(hotel.basicInfo.hotelStarRating))}
                          </p>
                        )}
                        <div className="flex flex-wrap gap-2 mt-3">
                          <span className="px-3 py-1.5 bg-blue-100 text-blue-800 rounded-lg text-xs font-semibold">
                            ROOMS: {hotel.roomName || "Standard Room"}
                          </span>
                          <span className="px-3 py-1.5 bg-blue-100 text-blue-800 rounded-lg text-xs font-semibold">
                            MEAL PLAN: {hotel.mealPlan || "Breakfast"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Similar Hotels Section */}
                  {hotel.similarhotel && hotel.similarhotel.length > 0 && (
                    <div className="bg-gray-50 rounded-lg p-4 md:p-6 border border-gray-200">
                      <h4 className="text-sm md:text-base font-semibold text-gray-700 mb-3 flex items-center gap-2">
                        <svg className="w-4 h-4 md:w-5 md:h-5 text-[#2d2d44]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        Similar Hotels for {hotel.propertyName}
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                        {hotel.similarhotel.map((similarHotel, simIndex) => (
                          <div key={simIndex} className="bg-white rounded-lg p-3 md:p-4 border border-gray-300 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <h5 className="font-semibold text-gray-900 text-sm md:text-base break-words flex-1">
                                {similarHotel.propertyName || "Similar Hotel"}
                              </h5>
                              {similarHotel.rating && (
                                <div className="flex items-center gap-1 flex-shrink-0">
                                  <span className="text-yellow-500 text-xs md:text-sm">
                                    {"★".repeat(Math.round(similarHotel.rating))}
                                  </span>
                                  <span className="text-gray-500 text-xs">({similarHotel.rating})</span>
                                </div>
                              )}
                            </div>
                            {similarHotel.day && (
                              <p className="text-xs text-gray-600">
                                Day {similarHotel.day}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {dayActivities.length > 0 && (
                <div className="mt-3 md:mt-4">
                  <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2 text-sm md:text-base">
                    <svg className="w-4 h-4 md:w-5 md:h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10l-2-2m0 0l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Activities
                  </h4>
                  <div className="space-y-2 md:space-y-3">
                    {dayActivities.slice(0, 3).map((activity, actIndex) => (
                      <div key={actIndex} className="p-2 md:p-3 bg-gray-50 rounded border border-gray-200">
                        <h5 className="font-semibold text-gray-900 mb-1 text-xs md:text-sm">{activity.title}</h5>
                        <p className="text-xs md:text-sm text-gray-700">{decodeHtmlEntities(activity.description)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })}
      
      {/* Satisfaction Buttons */}
      <SatisfactionButtons
        question="Satisfied with Journey Itinerary?"
        message="the Journey Itinerary"
        packageInfo={packageInfo}
        selectedLead={selectedLead}
      />
    </div>
  );
};

// Summary Tab Component - Day-wise with theme color header design
const SummaryTab = ({ itineraryDays, hotels, selectedLead, packageInfo, formatDate, decodeHtmlEntities }) => {
  const startDate = selectedLead?.travelDate ? new Date(selectedLead.travelDate) : new Date();

  const getHotelForDay = (dayObj) => {
    if (!dayObj || !hotels) return null;
    return hotels.find((hotel) => String(hotel.day) === String(dayObj.day));
  };

  return (
    <div className="space-y-4 md:space-y-6">
      {itineraryDays.map((day, index) => {
        const dayData = day.selectedItinerary || {};
        const currentDate = new Date(startDate);
        currentDate.setDate(startDate.getDate() + index);
        const hotel = getHotelForDay(day);
        const similarHotels = hotel?.similarhotel || [];

        return (
          <div key={index} className="space-y-4">
            <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
              {/* Theme Color Header Section */}
              <div className="bg-[#2d2d44] px-4 md:px-6 py-4 md:py-5">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 md:gap-4">
                  {/* Day Number Circle */}
                  <div className="bg-white text-[#2d2d44] rounded-full w-12 h-12 md:w-14 md:h-14 flex items-center justify-center font-bold text-lg md:text-xl flex-shrink-0">
                    {String(index + 1).padStart(2, "0")}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 md:gap-3 mb-2">
                      <span className="text-white text-sm md:text-base">{formatDate(currentDate)}</span>
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 md:w-5 md:h-5 text-white flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span className="text-white text-sm md:text-base font-medium">{dayData.cityName || "Destination"}</span>
                      </div>
                    </div>
                    <h3 className="text-white text-lg md:text-xl lg:text-2xl font-bold break-words">{dayData.itineraryTitle || `Day ${index + 1}`}</h3>
                  </div>
                </div>
              </div>

              {/* Content Section */}
              <div className="px-4 md:px-6 py-4 md:py-6 bg-white">
                <p className="text-gray-700 text-sm md:text-base leading-relaxed">
                  {decodeHtmlEntities(dayData.itineraryDescription || "Start your day with a delicious complimentary breakfast at the hotel. Prepare for the day's local exploration and sightseeing.")}
                </p>
              </div>
            </div>

            {/* Similar Hotels Section */}
            {hotel && similarHotels.length > 0 && (
              <div className="bg-gray-50 rounded-lg p-4 md:p-6 border border-gray-200">
                <h4 className="text-sm md:text-base font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <svg className="w-4 h-4 md:w-5 md:h-5 text-[#2d2d44]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  Similar Hotels for {hotel.propertyName || `Day ${index + 1}`}
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                  {similarHotels.map((similarHotel, simIndex) => (
                    <div key={simIndex} className="bg-white rounded-lg p-3 md:p-4 border border-gray-300 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h5 className="font-semibold text-gray-900 text-sm md:text-base break-words flex-1">
                          {similarHotel.propertyName || "Similar Hotel"}
                        </h5>
                        {similarHotel.rating && (
                          <div className="flex items-center gap-1 flex-shrink-0">
                            <span className="text-yellow-500 text-xs md:text-sm">
                              {"★".repeat(Math.round(similarHotel.rating))}
                            </span>
                            <span className="text-gray-500 text-xs">({similarHotel.rating})</span>
                          </div>
                        )}
                      </div>
                      {similarHotel.day && (
                        <p className="text-xs text-gray-600">
                          Day {similarHotel.day}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })}
      
      {/* Satisfaction Buttons */}
      <SatisfactionButtons
        question="Satisfied with Journey Itinerary?"
        message="the Journey Itinerary"
        packageInfo={packageInfo}
        selectedLead={selectedLead}
      />
    </div>
  );
};

// Transfers Tab Component - With images
const TransfersTab = ({ transfers, selectedLead, packageInfo, cabImageCache, findCabImage }) => {
  if (!transfers || transfers.length === 0) {
    return (
      <div className="space-y-3 md:space-y-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6">
          <p className="text-gray-600 text-sm md:text-base">No transfer information available.</p>
        </div>
        
        {/* Satisfaction Buttons */}
        <SatisfactionButtons
          question="Satisfied with Transport?"
          message="the Transport"
          packageInfo={packageInfo}
          selectedLead={selectedLead}
        />
      </div>
    );
  }

  return (
    <div className="space-y-3 md:space-y-4">
      <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 md:mb-6">Your Transport</h2>
      {transfers.map((transfer, index) => {
        const cabImage = cabImageCache[index] || findCabImage(transfer?.cabName, transfer?.cabType);
        return (
          <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6">
            <div className=" rounded-lg p-3 md:p-4 border border-blue-200">
              <div className="flex flex-col sm:flex-row items-start gap-3 md:gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-900 text-base md:text-lg mb-2 break-words">
                    {transfer.cabName || "Standard Vehicle"}
                  </h3>
                  <p className="text-gray-600 mb-3 text-sm md:text-base">{transfer.cabType || "Sedan"}</p>
                  <div className="flex flex-col sm:flex-row gap-4 md:gap-6">
                    {transfer.vehicleCategory && (
                      <div>
                        <span className="text-xs text-gray-500 uppercase">Category</span>
                        <p className="font-semibold text-gray-900 text-sm md:text-base">{transfer.vehicleCategory}</p>
                      </div>
                    )}
                    <div>
                      <span className="text-xs text-gray-500 uppercase">Seating</span>
                      <p className="font-semibold text-gray-900 text-sm md:text-base">
                        {transfer.cabSeatingCapacity || "4"} Seater
                      </p>
                    </div>
                  </div>
                </div>
                {cabImage && (
                  <div className="w-full sm:w-40 md:w-48 h-32 md:h-40 rounded-lg overflow-hidden flex-shrink-0">
                    <img
                      src={cabImage}
                      alt={transfer.cabName || "Vehicle"}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
      
      {/* Satisfaction Buttons */}
      <SatisfactionButtons
        question="Satisfied with Transport?"
        message="the Transport"
        packageInfo={packageInfo}
        selectedLead={selectedLead}
      />
    </div>
  );
};

// Stay Tab Component - Day-wise
const StayTab = ({ hotels, itineraryDays, selectedLead, packageInfo, formatDate, formatOrdinal }) => {
  const getGroupedHotels = () => {
    if (!hotels || !itineraryDays) return [];
    
    const grouped = [];
    const processedHotels = new Set();
    
    itineraryDays.forEach((day, dayIndex) => {
      const hotel = hotels.find((h) => String(h.day) === String(day.day));
      if (!hotel || processedHotels.has(hotel.propertyName)) return;
      
      const consecutiveDays = [];
      for (let i = dayIndex; i < itineraryDays.length; i++) {
        const dayHotel = hotels.find((h) => String(h.day) === String(itineraryDays[i].day));
        if (dayHotel?.propertyName === hotel.propertyName) {
          consecutiveDays.push(i);
        } else {
          break;
        }
      }
      
      if (consecutiveDays.length > 0) {
        processedHotels.add(hotel.propertyName);
        const startDate = selectedLead?.travelDate ? new Date(selectedLead.travelDate) : new Date();
        const checkInDate = new Date(startDate);
        checkInDate.setDate(startDate.getDate() + consecutiveDays[0]);
        
        // Get similar hotels for this hotel
        const similarHotels = hotel.similarhotel || [];
        
        grouped.push({
          hotel,
          consecutiveDays,
          checkInDate,
          city: hotel.cityName || hotel.hotelCity || "",
          similarHotels,
        });
      }
    });
    
    return grouped;
  };

  const groupedHotels = getGroupedHotels();

  return (
    <div className="space-y-4 md:space-y-6">
      <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 md:mb-6">Your Hotels</h2>
      {groupedHotels.map((group, index) => {
        const { hotel, consecutiveDays, checkInDate, city, similarHotels } = group;
        const starRating = hotel.basicInfo?.hotelStarRating || hotel.starRating;

        return (
          <div key={index} className="space-y-4">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-4 md:p-6">
                <div className=" rounded-lg p-3 md:p-4 border border-blue-200">
                  <div className="flex flex-col sm:flex-row items-start gap-3 md:gap-4">
                      {(() => {
                        const hotelImageUrl = getHotelImageUrl(hotel);
                        const proxiedUrl = hotelImageUrl ? getProxiedImageUrl(hotelImageUrl) : null;
                        return hotelImageUrl ? (
                          <img
                            src={proxiedUrl || hotelImageUrl}
                            alt={hotel.propertyName || "Hotel"}
                            className="w-full sm:w-32 h-24 sm:h-28 object-cover rounded flex-shrink-0"
                            loading="lazy"
                            onError={(e) => {
                              // Try original URL if proxy fails
                              if (proxiedUrl && e.target.src === proxiedUrl) {
                                e.target.src = hotelImageUrl;
                                e.target.onerror = () => {
                                  e.target.onerror = null;
                                  e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="128" height="96"%3E%3Crect width="128" height="96" fill="%23e5e7eb"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%239ca3af" font-family="Arial" font-size="12"%3ENo Image%3C/text%3E%3C/svg%3E';
                                };
                                return;
                              }
                              // If original URL also fails, show placeholder
                              e.target.onerror = null; // Prevent infinite loop
                              e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="128" height="96"%3E%3Crect width="128" height="96" fill="%23e5e7eb"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%239ca3af" font-family="Arial" font-size="12"%3ENo Image%3C/text%3E%3C/svg%3E';
                            }}
                          />
                        ) : (
                      <div className="w-full sm:w-32 h-24 sm:h-28 bg-gray-200 rounded flex items-center justify-center flex-shrink-0">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                      </div>
                    );
                  })()}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      {consecutiveDays.map((dayIdx) => (
                        <span
                          key={dayIdx}
                          className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded"
                        >
                          {formatOrdinal(dayIdx + 1)}
                        </span>
                      ))}
                      <span className="text-xs md:text-sm text-gray-600">Nights at <span className="font-semibold">{city || "Destination"}</span></span>
                    </div>
                    <p className="text-xs md:text-sm text-gray-500 mb-2">Check-in on {formatDate(checkInDate)}</p>
                    <h3 className="font-bold text-gray-900 text-base md:text-lg mb-1 break-words">{hotel.propertyName}</h3>
                    {starRating && (
                      <p className="text-yellow-500 text-xs md:text-sm mb-3">
                        {"★".repeat(Math.round(starRating))}
                      </p>
                    )}
                    <div className="flex flex-col sm:flex-row gap-4 md:gap-6 text-xs md:text-sm">
                      <div>
                        <span className="text-gray-500 uppercase">Rooms</span>
                        <p className="font-semibold text-gray-900">{hotel.roomName || "1 Deluxe Room"}</p>
                      </div>
                      <div>
                        <span className="text-gray-500 uppercase">Meal Plan</span>
                        <p className="font-semibold text-gray-900">{hotel.mealPlan || "Breakfast"}</p>
                      </div>
                    </div>
                  </div>
                </div>
                </div>
              </div>
            </div>

            {/* Similar Hotels Section */}
            {similarHotels && similarHotels.length > 0 && (
              <div className="bg-gray-50 rounded-lg p-4 md:p-6 border border-gray-200">
                <h4 className="text-sm md:text-base font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <svg className="w-4 h-4 md:w-5 md:h-5 text-[#2d2d44]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  Similar Hotels for {hotel.propertyName}
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                  {similarHotels.map((similarHotel, simIndex) => (
                    <div key={simIndex} className="bg-white rounded-lg p-3 md:p-4 border border-gray-300 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h5 className="font-semibold text-gray-900 text-sm md:text-base break-words flex-1">
                          {similarHotel.propertyName || "Similar Hotel"}
                        </h5>
                        {similarHotel.rating && (
                          <div className="flex items-center gap-1 flex-shrink-0">
                            <span className="text-yellow-500 text-xs md:text-sm">
                              {"★".repeat(Math.round(similarHotel.rating))}
                            </span>
                            <span className="text-gray-500 text-xs">({similarHotel.rating})</span>
                          </div>
                        )}
                      </div>
                      {similarHotel.day && (
                        <p className="text-xs text-gray-600">
                          Day {similarHotel.day}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })}
      
      {/* Satisfaction Buttons */}
      <SatisfactionButtons
        question="Satisfied with Hotels?"
        message="the Hotels"
        packageInfo={packageInfo}
        selectedLead={selectedLead}
      />
    </div>
  );
};

// Inclusions Section - Fixed parsing (matching PlutoToursPDF)
const InclusionsSection = ({ packageInfo, decodeHtmlEntities }) => {
  // Check both packageInclusions and package.packageInclusions
  const inclusionsText = packageInfo.packageInclusions || packageInfo.package?.packageInclusions || "";
  
  if (!inclusionsText) {
    return null;
  }

  const parsedItems = parseHtmlContent(inclusionsText);
  const allItems = [];
  
  parsedItems.forEach((textSegments) => {
    // parseHtmlContent now returns array of strings, so textSegments is a string
    const textContent = typeof textSegments === 'string' ? textSegments : String(textSegments || '');
    
    // Split by newline or multiple spaces to create separate items
    const lines = textContent.split(/\n+/).filter(line => line.trim().length > 0);
    if (lines.length > 0) {
      lines.forEach(line => {
        allItems.push(line.trim());
      });
    } else if (textContent.trim().length > 0) {
      allItems.push(textContent.trim());
    }
  });

  if (allItems.length === 0) {
    return null;
  }
  

  return (
    <div className=" rounded-2xl shadow-lg overflow-hidden">
      {/* Header Section */}
      <div className="px-3 py-3 bg-[#2d2d44]">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center flex-shrink-0 shadow-lg border-2 border-green-500">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <h3 className="text-xl md:text-2xl font-bold text-white">PACKAGE INCLUSIONS</h3>
            <p className="text-white/90 text-sm mt-0.5">Everything included in your journey</p>
          </div>
        </div>
      </div>
      
      {/* Content Section - Light Blue Background */}
      <div className=" px-4 py-3">
        <div className="space-y-1.5">
          {allItems.map((item, index) => {
            const formattedText = formatInclusionExclusionText(item);
            const isFirstItem = index === 0;
            return (
              <div key={index} className=" rounded-lg  p-2 flex items-start gap-2">
                <div className="flex-shrink-0 mt-1">
                  {isFirstItem ? (
                    <svg className="w-6 h-6 text-[#2d2d44]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-[#2d2d44] flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                  )}
                </div>
                <span className="text-gray-800 text-sm md:text-base leading-relaxed flex-1">
                  {formattedText}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// Exclusions Section - Fixed parsing with custom exclusions (matching PlutoToursPDF)
const ExclusionsSection = ({ packageInfo, decodeHtmlEntities, showOnlyMain = false }) => {
  // Check both packageExclusions and package.packageExclusions
  const exclusionsText = packageInfo.packageExclusions || packageInfo.package?.packageExclusions || "";
  const customExclusions = packageInfo.customExclusions || packageInfo.package?.customExclusions || [];
  
  const parsedItems = parseHtmlContent(exclusionsText);
  const allItems = [];
  
  parsedItems.forEach((textSegments) => {
    // parseHtmlContent now returns array of strings, so textSegments is a string
    const textContent = typeof textSegments === 'string' ? textSegments : String(textSegments || '');
    
    // Split by newline or multiple spaces to create separate items
    const lines = textContent.split(/\n+/).filter(line => line.trim().length > 0);
    if (lines.length > 0) {
      lines.forEach(line => {
        allItems.push(line.trim());
      });
    } else if (textContent.trim().length > 0) {
      allItems.push(textContent.trim());
    }
  });

  if (showOnlyMain && allItems.length === 0) {
    return null;
  }

  if (!showOnlyMain && allItems.length === 0 && customExclusions.length === 0) {
    return null;
  }

  return (
    <div className=" rounded-2xl shadow-lg overflow-hidden">
      {/* Header Section */}
      <div className="px-3 py-3 bg-[#2d2d44]">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center flex-shrink-0 shadow-lg border-2 border-green-500">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <div>
            <h3 className="text-xl md:text-2xl font-bold text-white">PACKAGE EXCLUSIONS</h3>
            <p className="text-white/90 text-sm mt-0.5">Items not included in your package</p>
          </div>
        </div>
      </div>
      
      {/* Content Section - Light Blue Background */}
      <div className=" px-4 py-3">
        <div className="space-y-1.5">
          {/* Main Exclusions */}
          {allItems.map((item, index) => {
            const formattedText = formatInclusionExclusionText(item);
            const isFirstItem = index === 0;
            return (
              <div key={index} className=" rounded-lg  p-2 flex items-start gap-2">
                <div className="flex-shrink-0 mt-1">
                  {isFirstItem ? (
                    <svg className="w-6 h-6 text-[#2d2d44]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-[#2d2d44] flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                  )}
                </div>
                <span className="text-gray-800 text-sm md:text-base leading-relaxed flex-1">
                  {formattedText}
                </span>
              </div>
            );
          })}

          {/* Custom Exclusions - Only show if showOnlyMain is false */}
          {!showOnlyMain && customExclusions.map((section, sectionIndex) => {
            const sectionItems = parseHtmlContent(section.description || "");
            const sectionAllItems = [];
            
            sectionItems.forEach((textSegments) => {
              const textContent = typeof textSegments === 'string' ? textSegments : String(textSegments || '');
              const lines = textContent.split(/\n+/).filter(line => line.trim().length > 0);
              if (lines.length > 0) {
                lines.forEach(line => {
                  sectionAllItems.push(line.trim());
                });
              } else if (textContent.trim().length > 0) {
                sectionAllItems.push(textContent.trim());
              }
            });

            if (sectionAllItems.length === 0) return null;

            return (
              <div key={sectionIndex} className={`${sectionIndex > 0 || allItems.length > 0 ? 'mt-2' : ''}`}>
                {section.name && (
                  <div className="bg-[#2d2d44] rounded-lg mb-2 px-3 py-2">
                    <h4 className="text-xl md:text-2xl font-bold text-white">
                      {section.name.toUpperCase()}
                    </h4>
                  </div>
                )}
                <div className="space-y-1.5">
                  {sectionAllItems.map((item, idx) => {
                    const formattedText = formatInclusionExclusionText(item);
                    const isFirstItemInSection = idx === 0 && (sectionIndex === 0 && allItems.length === 0);
                    return (
                      <div key={idx} className=" rounded-lg  p-2 flex items-start gap-2">
                        <div className="flex-shrink-0 mt-1">
                          {isFirstItemInSection ? (
                            <svg className="w-6 h-6 text-[#2d2d44]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                            </svg>
                          ) : (
                            <div className="w-6 h-6 rounded-full bg-[#2d2d44] flex items-center justify-center">
                              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                              </svg>
                            </div>
                          )}
                        </div>
                        <span className="text-gray-800 text-sm md:text-base leading-relaxed flex-1">
                          {formattedText}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// Custom Exclusions Section Component
const CustomExclusionsSection = ({ packageInfo, decodeHtmlEntities }) => {
  const customExclusions = packageInfo.customExclusions || packageInfo.package?.customExclusions || [];
  
  if (customExclusions.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6">
        <p className="text-gray-600 text-sm md:text-base">No custom exclusions available.</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl shadow-lg overflow-hidden">
      {/* Header Section */}
      <div className="px-3 py-3 bg-[#2d2d44]">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center flex-shrink-0 shadow-lg border-2 border-green-500">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <div>
            <h3 className="text-xl md:text-2xl font-bold text-white">CUSTOM EXCLUSIONS</h3>
          </div>
        </div>
      </div>
      
      {/* Content Section */}
      <div className="px-4 py-3">
        <div className="space-y-1.5">
          {customExclusions.map((section, sectionIndex) => {
            const sectionItems = parseHtmlContent(section.description || "");
            const sectionAllItems = [];
            
            sectionItems.forEach((textSegments) => {
              const textContent = typeof textSegments === 'string' ? textSegments : String(textSegments || '');
              const lines = textContent.split(/\n+/).filter(line => line.trim().length > 0);
              if (lines.length > 0) {
                lines.forEach(line => {
                  sectionAllItems.push(line.trim());
                });
              } else if (textContent.trim().length > 0) {
                sectionAllItems.push(textContent.trim());
              }
            });

            if (sectionAllItems.length === 0) return null;

            return (
              <div key={sectionIndex} className={sectionIndex > 0 ? 'mt-4' : ''}>
                {section.name && (
                  <div className="bg-[#2d2d44] rounded-lg mb-2 px-3 py-2">
                    <h4 className="text-xl md:text-2xl font-bold text-white">
                      {section.name.toUpperCase()}
                    </h4>
                  </div>
                )}
                <div className="space-y-1.5">
                  {sectionAllItems.map((item, idx) => {
                    const formattedText = formatInclusionExclusionText(item);
                    const isFirstItem = idx === 0;
                    return (
                      <div key={idx} className="rounded-lg p-2 flex items-start gap-2">
                        <div className="flex-shrink-0 mt-1">
                          {isFirstItem ? (
                            <svg className="w-6 h-6 text-[#2d2d44]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                            </svg>
                          ) : (
                            <div className="w-6 h-6 rounded-full bg-[#2d2d44] flex items-center justify-center">
                              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                              </svg>
                            </div>
                          )}
                        </div>
                        <span className="text-gray-800 text-sm md:text-base leading-relaxed flex-1">
                          {formattedText}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// Reviews Section Component
const ReviewsSection = ({ reviews, placePhotos, reviewsScrollRef }) => {
  const scrollLeft = () => {
    if (reviewsScrollRef.current) {
      const scrollAmount = window.innerWidth >= 1024 ? 380 + 24 : window.innerWidth >= 768 ? 350 + 24 : 280 + 16;
      reviewsScrollRef.current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (reviewsScrollRef.current) {
      const scrollAmount = window.innerWidth >= 1024 ? 380 + 24 : window.innerWidth >= 768 ? 350 + 24 : 280 + 16;
      reviewsScrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={i < rating ? 'text-yellow-400' : 'text-gray-300'}>
        ★
      </span>
    ));
  };

  // Function to get a place photo for each review (cycling through the array)
  const getPhotoForReview = (index) => {
    if (!placePhotos || placePhotos.length === 0) return null;
    return placePhotos[index % placePhotos.length].photo_url;
  };

  return (
    <>
      <style>{`
        .reviews-scroll::-webkit-scrollbar {
          display: none;
        }
        .reviews-scroll {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
      <div className=" rounded-2xl shadow-lg border-2  p-6 md:p-8">
        <div className="mb-6 p-2 border-2 border-white/30 rounded-lg bg-[#2d2d44]">
          <h2 className="text-xl md:text-2xl font-bold text-white mb-2">
            Customer Reviews
          </h2>
          <p className="text-white text-sm md:text-base">
            What our customers say about us
          </p>
        </div>

        {/* Reviews Container with Scroll */}
        <div className="relative">
        {/* Scroll Buttons - Desktop Only */}
        <button
          onClick={scrollLeft}
          className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 bg-white rounded-full p-3 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110 border-2 border-blue-200"
          aria-label="Scroll left"
        >
          <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <div
          ref={reviewsScrollRef}
          className="reviews-scroll flex gap-4 md:gap-6 overflow-x-auto scroll-smooth pb-4"
        >
          {reviews.map((review, index) => {
            const cardBackgroundImage = getPhotoForReview(index);
            return (
            <div
              key={index}
              className=" flex-shrink-0 w-[280px] md:min-w-[350px] lg:min-w-[380px]  rounded-xl shadow-md border-2 border-white/30 p-5 md:p-6 hover:shadow-xl transition-all duration-200 hover:scale-105 relative overflow-hidden"
              style={{
                backgroundImage: cardBackgroundImage ? `url(${cardBackgroundImage})` : 'none',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
              }}
            >
              {/* Overlay for better text readability on each card */}
              <div className="absolute inset-0  z-0"></div>
              
              {/* Content with relative positioning */}
              <div className="relative z-10 ">
                {/* Review Header */}
                <div className="flex items-start gap-3 mb-4 ">
                  <img
                    src={review.profile_photo_url || 'https://via.placeholder.com/48'}
                    alt={review.author_name}
                    className="w-12 h-12 rounded-full object-cover border-2 border-white/50"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/48';
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-white text-sm md:text-base truncate">
                      {review.author_name}
                    </h3>
                    <div className="flex items-center gap-1 mt-1">
                      {renderStars(review.rating)}
                      <span className="text-white/90 text-xs ml-1">{review.rating}</span>
                    </div>
                    <p className="text-white/80 text-xs mt-1">{review.relative_time_description}</p>
                  </div>
                </div>

                {/* Review Text */}
                <div className="mt-4">
                  <p className="text-white text-sm md:text-base leading-relaxed line-clamp-4">
                    {review.text}
                  </p>
                </div>

                {/* Review Footer */}
                <div className="mt-4 pt-4 border-t border-white/30">
                  <a
                    href={review.author_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white/90 hover:text-white text-xs font-medium flex items-center gap-1 transition-colors"
                  >
                    View on Google
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>
            );
          })}
        </div>

        <button
          onClick={scrollRight}
          className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-20 bg-white rounded-full p-3 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110 border-2 border-blue-200"
          aria-label="Scroll right"
        >
          <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

        {/* Scroll Indicator - Mobile */}
        <div className="md:hidden mt-4 text-center">
          <p className="text-gray-500 text-xs">Swipe to see more reviews</p>
        </div>
      </div>
    </>
  );
};

// Account Details Section Component
const AccountDetailsSection = () => {
  return (
    <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-200 p-6 md:p-8">
      <div className="mb-6">
        <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">
          ACCOUNT DETAILS AND UPI ID
        </h2>
      </div>

      {/* Bank Grid Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* SBI Section */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border-2 border-blue-200 shadow-md">
          <h3 className="font-bold text-gray-900 text-sm md:text-base mb-3">STATE BANK OF INDIA A/C</h3>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 text-xs md:text-sm font-medium">A/C No:</span>
              <span className="text-gray-900 text-xs md:text-sm font-semibold">38207849663</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 text-xs md:text-sm font-medium">A/C Name:</span>
              <span className="text-gray-900 text-xs md:text-sm font-semibold">PTW HOLIDAYS PVT. LTD.</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 text-xs md:text-sm font-medium">Branch:</span>
              <span className="text-gray-900 text-xs md:text-sm font-semibold">PANTHAGHATI-SHIMLA</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 text-xs md:text-sm font-medium">IFSC Code:</span>
              <span className="text-gray-900 text-xs md:text-sm font-semibold">SBIN0021763</span>
            </div>
          </div>
        </div>

        {/* HDFC Section */}
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border-2 border-purple-200 shadow-md">
          <h3 className="font-bold text-gray-900 text-sm md:text-base mb-3">HDFC BANK</h3>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 text-xs md:text-sm font-medium">A/C No:</span>
              <span className="text-gray-900 text-xs md:text-sm font-semibold">50200044011800</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 text-xs md:text-sm font-medium">A/C Name:</span>
              <span className="text-gray-900 text-xs md:text-sm font-semibold">PTW HOLIDAYS PVT LTD</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 text-xs md:text-sm font-medium">Branch:</span>
              <span className="text-gray-900 text-xs md:text-sm font-semibold">MAHELI-SHIMLA</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 text-xs md:text-sm font-medium">IFSC Code:</span>
              <span className="text-gray-900 text-xs md:text-sm font-semibold">HDFC0003612</span>
            </div>
          </div>
        </div>

        {/* ICICI Section */}
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4 border-2 border-orange-200 shadow-md">
          <h3 className="font-bold text-gray-900 text-sm md:text-base mb-3">ICICI BANK</h3>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 text-xs md:text-sm font-medium">A/C No:</span>
              <span className="text-gray-900 text-xs md:text-sm font-semibold">36680550120</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 text-xs md:text-sm font-medium">A/C Name:</span>
              <span className="text-gray-900 text-xs md:text-sm font-semibold">PTW HOLIDAYS PVT LTD</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 text-xs md:text-sm font-medium">Branch:</span>
              <span className="text-gray-900 text-xs md:text-sm font-semibold">KASUMPATI-SHIMLA</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 text-xs md:text-sm font-medium">IFSC Code:</span>
              <span className="text-gray-900 text-xs md:text-sm font-semibold">ICIC0003368</span>
            </div>
          </div>
        </div>

        {/* Bank of Baroda Section */}
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border-2 border-green-200 shadow-md">
          <h3 className="font-bold text-gray-900 text-sm md:text-base mb-3">BANK OF BARODA</h3>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 text-xs md:text-sm font-medium">A/C No:</span>
              <span className="text-gray-900 text-xs md:text-sm font-semibold">54140200000060</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 text-xs md:text-sm font-medium">A/C Name:</span>
              <span className="text-gray-900 text-xs md:text-sm font-semibold">PTW HOLIDAYS PVT LTD</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 text-xs md:text-sm font-medium">Branch:</span>
              <span className="text-gray-900 text-xs md:text-sm font-semibold">BCS-SHIMLA</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 text-xs md:text-sm font-medium">IFSC Code:</span>
              <span className="text-gray-900 text-xs md:text-sm font-semibold">BARB0NEWSIM</span>
            </div>
          </div>
        </div>
      </div>

      {/* UPI Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-4 border-2 border-yellow-200 shadow-md">
          <h3 className="font-bold text-gray-900 text-sm md:text-base mb-2">GOOGLE PAY @ PHONE PAY</h3>
          <p className="text-gray-900 text-base md:text-lg font-semibold">80917-53823</p>
        </div>
        <div className="bg-gradient-to-br from-pink-50 to-pink-100 rounded-xl p-4 border-2 border-pink-200 shadow-md">
          <h3 className="font-bold text-gray-900 text-sm md:text-base mb-2">UPI ID</h3>
          <div className="space-y-1">
            <p className="text-gray-900 text-sm md:text-base font-semibold">UpId: mdplutotours-2@okhdfcbank</p>
            <p className="text-gray-900 text-sm md:text-base font-semibold">UpId: 981666196@sbi</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Mission Section Component with Team Photo
const MissionSection = () => {
  const teamPhotoUrl = "https://res.cloudinary.com/dcp1ev1uk/image/upload/v1765016884/WhatsApp_Image_2025-12-06_at_3.51.58_PM_ietyrs.jpg";
  
  return (
    <div 
      className="rounded-2xl shadow-lg border-2 border-blue-200 p-4 md:p-6 lg:p-8 overflow-hidden relative min-h-[400px] md:min-h-[500px]"
      style={{
        backgroundImage: `url(${teamPhotoUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      {/* Dark Overlay for text readability */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/60 to-black/70 z-0"></div>
      
      {/* Content overlaid on image */}
      <div className="relative z-10 h-full flex flex-col justify-center">
        <div className="mb-4 md:mb-6">
          <h2 className="text-xl md:text-3xl lg:text-4xl font-bold text-white mb-2 md:mb-3">
            Our Mission
          </h2>
          <div className="w-20 md:w-32 h-1 md:h-1.5 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-full"></div>
        </div>
        
        <div className="space-y-3 md:space-y-4 text-white">
          <p className="text-sm md:text-base lg:text-lg leading-relaxed text-white/95">
            At PTW Holidays, our mission is to create unforgettable travel experiences that connect people with the beauty and culture of incredible destinations. We are committed to providing exceptional service, personalized itineraries, and authentic experiences that exceed our customers' expectations.
          </p>
          <p className="text-sm md:text-base lg:text-lg leading-relaxed text-white/95 hidden md:block">
            Our dedicated team works tirelessly to ensure every journey is seamless, memorable, and filled with moments that last a lifetime. We believe in building lasting relationships with our clients and partners, making travel accessible, enjoyable, and truly transformative.
          </p>
        </div>

        {/* Mission Values */}
        <div className="mt-4 md:mt-6 grid grid-cols-3 gap-2 md:gap-4">
          <div className="bg-white/20 backdrop-blur-md rounded-lg p-3 md:p-4 border border-white/30 shadow-lg">
            <div className="text-2xl md:text-3xl mb-1 md:mb-2">🌟</div>
            <h3 className="font-semibold text-white text-xs md:text-sm mb-0.5 md:mb-1">Excellence</h3>
            <p className="text-[10px] md:text-xs text-white/90 hidden md:block">Delivering outstanding service</p>
          </div>
          <div className="bg-white/20 backdrop-blur-md rounded-lg p-3 md:p-4 border border-white/30 shadow-lg">
            <div className="text-2xl md:text-3xl mb-1 md:mb-2">🤝</div>
            <h3 className="font-semibold text-white text-xs md:text-sm mb-0.5 md:mb-1">Trust</h3>
            <p className="text-[10px] md:text-xs text-white/90 hidden md:block">Building lasting relationships</p>
          </div>
          <div className="bg-white/20 backdrop-blur-md rounded-lg p-3 md:p-4 border border-white/30 shadow-lg">
            <div className="text-2xl md:text-3xl mb-1 md:mb-2">✈️</div>
            <h3 className="font-semibold text-white text-xs md:text-sm mb-0.5 md:mb-1">Adventure</h3>
            <p className="text-[10px] md:text-xs text-white/90 hidden md:block">Creating memorable journeys</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Company Footer Component
const CompanyFooter = () => {
  return (
    <div className="bg-[#2d2d44] rounded-lg p-2 sm:p-3">
      {/* Company Logo and Name Section */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-2 mb-2 pb-2 border-b border-white/10">
        <img
          src="https://res.cloudinary.com/dcp1ev1uk/image/upload/v1749122411/PTW_Holidays_Logo_1_mgi4uu.png"
          alt="PTW Holidays Logo"
          className="w-32 h-32 sm:w-36 sm:h-40 object-contain"
        />
        <div className="text-center">
          <h3 className="text-lg sm:text-xl font-bold text-white">
            PTW Holidays Pvt. Ltd.
          </h3>
          <p className="text-gray-300 text-xs">Your Trusted Travel Partner</p>
        </div>
      </div>

      {/* Contact Information - Compact Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-2">
        {/* Address */}
        <div className="grid grid-cols-[auto_1fr] gap-1 items-start text-center sm:text-left">
          
         
          <p className="text-white text-xs leading-snug">
           Dari ,Dharamshala, Himachal Pradesh 176057
          </p>
        </div>

        {/* Phone */}
        <div className="grid grid-cols-[auto_1fr] gap-1 items-start text-center sm:text-left">
          <div className="flex items-start justify-center sm:justify-start">
           
          </div>
          <p className="text-white text-xs font-medium">+91-8353056000</p>
        </div>

        {/* Website */}
        <div className="grid grid-cols-[auto_1fr] gap-1 items-start text-center sm:text-left">
          <div className="flex items-start justify-center sm:justify-start">
          
          </div>
          <p className="text-white text-xs font-medium">www.ptwholidays.com</p>
        </div>
      </div>

      {/* Social Media Links and Copyright */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-2 border-t border-white/10">
        <div className="flex justify-center gap-2">
          <div className="bg-white/10 hover:bg-white/20 rounded-full p-1.5 transition-colors duration-200 cursor-pointer">
            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
          </div>
          <div className="bg-white/10 hover:bg-white/20 rounded-full p-1.5 transition-colors duration-200 cursor-pointer">
            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
            </svg>
          </div>
          <div className="bg-white/10 hover:bg-white/20 rounded-full p-1.5 transition-colors duration-200 cursor-pointer">
            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
            </svg>
          </div>
        </div>
        <p className="text-gray-400 text-xs text-center">
          © {new Date().getFullYear()} PTW Holidays. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default PlutoLink;
