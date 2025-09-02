import React from "react";

const QuotePreviewDetails = ({
  packageSummary,
  showMargin,
  marginAmount,
  finalTotal,
  getCurrentMarginPercentage,
  companyName = "Pluto Tours and Travel",
  selectedLead,
  colorTheme,
  showDiscount,
  discountAmount,
  activeDiscountPercentage,
}) => {
  // Define color schemes
  const colors = {
    default: {
      primary: "#2d2d44",
      secondary: "#1E293B",
      accent: "#3B82F6",
      light: "#E2E8F0",
      background: "#F8FAFC",
    },
    orange: {
      primary: "#EA580C",
      secondary: "#C2410C",
      accent: "#F97316",
      light: "#FFEDD5",
      background: "#FFF7ED",
    },
  };
  const theme = colorTheme === "orange" ? colors.orange : colors.default;

  // Helper for safe access
  const safe = (val, fallback = "N/A") => (val !== undefined && val !== null ? val : fallback);

  // Calculate total with tax
  const taxAmount = finalTotal * 0.05;
  const totalWithTax = finalTotal + taxAmount;

  // Unique cities
  const uniqueCities = Array.from(
    new Set(
      packageSummary.package?.itineraryDays?.map((day) => day.selectedItinerary.cityName)
    )
  );

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', color: theme.secondary, background: '#fff', borderRadius: 12, boxShadow: '0 2px 16px rgba(0,0,0,0.08)', padding: 24, maxWidth: 1200, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `2px solid ${theme.light}`, paddingBottom: 16 }}>
        <div>
          <h2 style={{ color: theme.primary, fontWeight: 700, fontSize: 28 }}>{companyName}</h2>
          <div style={{ color: theme.secondary, fontSize: 14, marginTop: 4 }}>info@plutotours.com</div>
        </div>
        <img src="https://res.cloudinary.com/dcp1ev1uk/image/upload/v1724223770/logo_easm3q.png" alt="Logo" style={{ width: 90, height: 30, objectFit: 'contain' }} />
      </div>

      {/* Images */}
      <div style={{ display: 'flex', gap: 12, margin: '24px 0' }}>
        {[0, 1, 2].map((i) => (
          <div key={i} style={{ flex: 1, height: 140, borderRadius: 8, overflow: 'hidden', border: `1px solid ${theme.light}` }}>
            <img
              src={
                packageSummary.package?.images?.[i] ||
                [
                  "https://res.cloudinary.com/dcp1ev1uk/image/upload/v1724223741/himaclahimg2_cs0qvm.jpg",
                  "https://res.cloudinary.com/dcp1ev1uk/image/upload/v1724223742/himaclahimg3_klatkm.jpg",
                  "https://res.cloudinary.com/dcp1ev1uk/image/upload/v1724223742/himaclahimg4_ujs3z9.jpg",
                ][i]
              }
              alt={`Gallery ${i + 1}`}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
        ))}
      </div>

      {/* Lead & Package Info */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 20, fontWeight: 700, color: theme.primary }}>{safe(selectedLead?.name)}'s trip to</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: theme.accent, margin: '4px 0' }}>{safe(packageSummary.package?.packageName, 'Package Name')}</div>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginTop: 8 }}>
            <span style={{ fontSize: 14, color: theme.secondary }}>{safe(packageSummary.package?.duration, '5N/6D')}</span>
            <span style={{ background: theme.light, color: theme.primary, borderRadius: 6, padding: '2px 8px', fontSize: 12, fontWeight: 500 }}>
              {packageSummary.package?.customizablePackage ? 'Customizable' : 'Fixed'}
            </span>
            <span style={{ fontSize: 14, color: theme.secondary }}>{safe(packageSummary.package?.packageType, 'Best Package')}</span>
          </div>
        </div>
        <div style={{ minWidth: 220, textAlign: 'right' }}>
          <div style={{ fontSize: 14, color: theme.secondary, marginBottom: 4 }}>Total Package Cost</div>
          <div style={{ fontSize: 32, fontWeight: 700, color: theme.primary }}>₹{showMargin ? finalTotal.toFixed(0) : safe(packageSummary.totals?.grandTotal, 0)}</div>
          <div style={{ fontSize: 12, color: theme.secondary, marginTop: 4 }}>
            For Adults: {safe(selectedLead?.adults, 0)}, Children: {safe(selectedLead?.kids, 0)}
          </div>
        </div>
      </div>

      {/* Lead Details */}
      <div style={{ background: theme.background, borderRadius: 8, border: `1px solid ${theme.light}`, padding: 16, marginBottom: 24 }}>
        <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 8, color: theme.primary }}>Your Details</div>
        <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap' }}>
          {/* Personal Info */}
          <div style={{ minWidth: 200, flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 4 }}>Personal Information</div>
            <div style={{ fontSize: 13, color: theme.secondary }}>Name: {safe(selectedLead?.name)}</div>
            <div style={{ fontSize: 13, color: theme.secondary }}>Contact: {safe(selectedLead?.mobile)}</div>
            <div style={{ fontSize: 13, color: theme.secondary }}>Email: {safe(selectedLead?.email)}</div>
          </div>
          {/* Travel Info */}
          <div style={{ minWidth: 200, flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 4 }}>Travel Information</div>
            <div style={{ fontSize: 13, color: theme.secondary }}>Date: {selectedLead?.travelDate ? new Date(selectedLead.travelDate).toLocaleDateString() : 'N/A'}</div>
            <div style={{ fontSize: 13, color: theme.secondary }}>Duration: {safe(selectedLead?.nights, 0)} Nights / {safe(selectedLead?.days, 0)} Days</div>
            <div style={{ fontSize: 13, color: theme.secondary }}>Package: {safe(selectedLead?.packageType)}</div>
          </div>
          {/* Guest Info */}
          <div style={{ minWidth: 200, flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 4 }}>Guest Information</div>
            <div style={{ fontSize: 13, color: theme.secondary }}>Adults: {safe(selectedLead?.adults, 0)}</div>
            <div style={{ fontSize: 13, color: theme.secondary }}>Children: {safe(selectedLead?.kids, 0)}</div>
            <div style={{ fontSize: 13, color: theme.secondary }}>Rooms: {safe(selectedLead?.noOfRooms, 0)}</div>
          </div>
        </div>
      </div>

      {/* Journey Overview */}
      <div style={{ background: theme.background, borderRadius: 8, border: `1px solid ${theme.light}`, padding: 16, marginBottom: 24 }}>
        <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 8, color: theme.primary }}>Journey Overview</div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 12 }}>
          {uniqueCities.map((city, idx) => (
            <div key={city} style={{ background: '#fff', borderRadius: 4, padding: 8, border: `1px solid ${theme.light}`, minWidth: 120, fontWeight: 600, color: theme.secondary }}>{city}</div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 20, marginTop: 12 }}>
          {/* Hotels */}
          <div style={{ flex: 1, background: '#fff', borderRadius: 8, border: `1px solid ${theme.light}`, padding: 12 }}>
            <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 6, color: theme.primary }}>Your Hotels</div>
            {packageSummary.hotels?.map((hotel, idx) => (
              <div key={idx} style={{ marginBottom: 6, background: theme.background, borderRadius: 6, padding: 5 }}>
                <div style={{ fontWeight: 600, color: theme.secondary }}>{hotel.propertyName}</div>
                <div style={{ fontSize: 13, color: theme.secondary }}>{hotel.basicInfo?.hotelStarRating}★ {hotel.mealPlan}</div>
              </div>
            ))}
          </div>
          {/* Transport */}
          <div style={{ flex: 1, background: '#fff', borderRadius: 8, border: `1px solid ${theme.light}`, padding: 12 }}>
            <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 6, color: theme.primary }}>Your Transport</div>
            {Array.isArray(packageSummary.transfer?.details) && packageSummary.transfer.details.length > 0 ? (
              packageSummary.transfer.details.map((cab, idx) => (
                <div key={cab._id || idx} style={{ background: '#F8FAFC', borderRadius: 6, padding: 5, marginBottom: 6 }}>
                  <div style={{ fontWeight: 600, color: theme.secondary, fontSize: 14, marginBottom: 1 }}>
                    {cab.cabName || 'Standard Vehicle'}
                  </div>
                  <div style={{ fontSize: 13, color: theme.secondary, marginBottom: 2 }}>
                    {cab.cabType || 'Sedan'}
                  </div>
                  <div style={{ display: 'flex', gap: 5, marginTop: 2 }}>
                    <div style={{ background: '#EFF6FF', padding: '1px 4px', borderRadius: 3, display: 'flex', alignItems: 'center', fontSize: 12, marginRight: 4 }}>
                      <span style={{ fontSize: 12, color: '#2d2d44', fontWeight: 500 }}>{cab.vehicleCategory || ''}</span>
                    </div>
                    <div style={{ background: '#EFF6FF', padding: '1px 4px', borderRadius: 3, display: 'flex', alignItems: 'center', fontSize: 12 }}>
                      <span style={{ fontSize: 12, color: '#2d2d44', fontWeight: 500 }}>{cab.cabSeatingCapacity || '4'} Seater</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ background: '#F8FAFC', borderRadius: 6, padding: 5 }}>
                <div style={{ fontWeight: 600, color: theme.secondary, fontSize: 14, marginBottom: 1 }}>Standard Vehicle</div>
                <div style={{ fontSize: 13, color: theme.secondary, marginBottom: 2 }}>Sedan</div>
                <div style={{ display: 'flex', gap: 5, marginTop: 2 }}>
                  <div style={{ background: '#EFF6FF', padding: '1px 4px', borderRadius: 3, display: 'flex', alignItems: 'center', fontSize: 12, marginRight: 4 }}>
                    <span style={{ fontSize: 12, color: '#2d2d44', fontWeight: 500 }}> </span>
                  </div>
                  <div style={{ background: '#EFF6FF', padding: '1px 4px', borderRadius: 3, display: 'flex', alignItems: 'center', fontSize: 12 }}>
                    <span style={{ fontSize: 12, color: '#2d2d44', fontWeight: 500 }}>4 Seater</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: 16 }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 13, color: theme.secondary }}>Total Cities</div>
            <div style={{ fontWeight: 700, fontSize: 16 }}>{uniqueCities.length}</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 13, color: theme.secondary }}>Total Days</div>
            <div style={{ fontWeight: 700, fontSize: 16 }}>{packageSummary.package?.itineraryDays?.length}</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 13, color: theme.secondary }}>Total Distance</div>
            <div style={{ fontWeight: 700, fontSize: 16 }}>{packageSummary.package?.itineraryDays?.reduce((acc, day) => acc + (day.selectedItinerary.distance || 0), 0)} km</div>
          </div>
        </div>
      </div>

      {/* Inclusions */}
      <div style={{ background: '#fff', borderRadius: 8, border: `1px solid ${theme.light}`, padding: 16, marginBottom: 24 }}>
        <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 8, color: theme.primary }}>Package Inclusions</div>
        <ul style={{ paddingLeft: 20, fontSize: 14, color: theme.secondary }}>
          <li>{packageSummary.hotels?.length || 0} Hotels accommodation with {packageSummary.package?.itineraryDays?.length || 0} days itinerary</li>
          <li>Meals as mentioned in the itinerary (MAP - Breakfast & Dinner)</li>
          <li>All transfers and sightseeing as per itinerary in {packageSummary.transfer?.details?.vehicleName || 'Standard Vehicle'}</li>
          <li>{packageSummary.activities?.length || 0} activities and excursions as mentioned</li>
          <li>All applicable taxes and service charges</li>
        </ul>
      </div>

      {/* Exclusions */}
      <div style={{ background: '#fff', borderRadius: 8, border: `1px solid ${theme.light}`, padding: 16, marginBottom: 24 }}>
        <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 8, color: theme.primary }}>Package Exclusions</div>
        <ul style={{ paddingLeft: 20, fontSize: 14, color: theme.secondary }}>
          {packageSummary?.package?.packageExclusions && packageSummary.package.packageExclusions.split("\n").filter(Boolean).map((exclusion, idx) => (
            <li key={idx}>{exclusion.trim().replace(/^\*\s*/, "")}</li>
          ))}
          {packageSummary?.package?.customExclusions?.map((section, idx) => (
            <li key={idx}><b>{section.name}:</b> {section.description}</li>
          ))}
        </ul>
      </div>

      {/* Cost Section */}
      <div style={{ background: theme.primary, color: '#fff', borderRadius: 10, padding: 20, marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 18 }}>Pay Now</div>
            <div style={{ fontSize: 13, color: '#E2E8F0', marginTop: 4 }}>Pay 40% of the total amount to confirm the booking</div>
          </div>
          <div style={{ fontSize: 28, fontWeight: 700 }}>₹{showMargin ? finalTotal.toFixed(0) : safe(packageSummary.totals?.grandTotal, 0)}</div>
        </div>
        <div style={{ marginTop: 16, background: '#FFFBEB', color: '#92400E', borderRadius: 8, border: '1px solid #FEF3C7', padding: 12 }}>
          <div style={{ fontWeight: 500, fontSize: 14 }}>Important Payment Information</div>
          <div style={{ fontSize: 13, marginTop: 8 }}>
            • 40% advance payment required to confirm booking<br />
            • Balance payment due 15 days before travel date<br />
            • Prices are subject to availability and may change
          </div>
        </div>
      </div>

      {/* Grand Total */}
      <div style={{ background: 'linear-gradient(90deg, #3B82F6 0%, #2563EB 100%)', color: '#fff', borderRadius: 10, padding: 20, marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 18 }}>Grand Total</div>
            <div style={{ fontSize: 13, color: '#E2E8F0' }}>with Margin & including 5% tax</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 28, fontWeight: 700 }}>₹{totalWithTax.toFixed(2)}</div>
            <div style={{ fontSize: 13, color: '#E2E8F0' }}>Total package cost</div>
          </div>
        </div>
      </div>

      {/* Agent Info */}
      <div style={{ background: theme.background, borderRadius: 8, border: `1px solid ${theme.light}`, padding: 16, marginBottom: 24, position: 'relative' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 8 }}>
          <div style={{ width: 40, height: 40, background: '#BFDBFE', borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 18, color: theme.primary }}>
            {(packageSummary.package?.agentName || 'P')[0].toUpperCase()}
          </div>
          <div>
            <div style={{ fontSize: 10, color: theme.secondary }}>TRAVEL EXPERT</div>
            <div style={{ fontWeight: 700, fontSize: 16, color: theme.primary }}>{packageSummary.package?.agentName || 'Pluto Tours Agent'}</div>
          </div>
        </div>
        <div style={{ marginLeft: 56, color: theme.secondary, fontSize: 13 }}>
          <div>Phone: {packageSummary.package?.agentPhone || '+91 98765 43210'}</div>
          <div>Email: info@plutotours.in</div>
        </div>
        <div style={{ marginTop: 12, fontSize: 12, color: theme.secondary, fontStyle: 'italic' }}>
          Quotation Created on {new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}
        </div>
        <div style={{ position: 'absolute', top: 16, right: 16, background: '#EFF6FF', padding: '4px 12px', borderRadius: 12, fontSize: 11, color: theme.primary, fontWeight: 700 }}>
          5+ Years Experience
        </div>
      </div>

      {/* Environmental Note */}
      <div style={{ background: '#ECFDF5', color: '#059669', borderRadius: 8, padding: 12, marginBottom: 24, textAlign: 'center', fontWeight: 500 }}>
        Please think twice before printing this mail. Save paper, it's good for the environment.
      </div>

      {/* Date Change Policy */}
      <div style={{ background: '#fff', borderRadius: 8, border: `1px solid ${theme.light}`, padding: 16, marginBottom: 24 }}>
        <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 8, color: theme.primary }}>Date Change Policy</div>
        <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>Your Current Policy</div>
        <div style={{ fontSize: 13, color: theme.secondary, marginBottom: 8 }}>
          Non Refundable. Date Change is not allowed.
        </div>
        <ul style={{ paddingLeft: 20, fontSize: 14, color: theme.secondary }}>
          <li>These are non-refundable amounts as per the current components attached. In the case of component change/modifications, the policy will change accordingly.</li>
          <li>Date Change fees don't include any fare change in the components on the new date. Fare difference as applicable will be charged separately.</li>
          <li>Date Change will depend on the availability of the components on the new requested date.</li>
          <li>Please note, TCS once collected cannot be refunded in case of any cancellation / modification. You can claim the TCS amount as adjustment against Income Tax payable at the time of filing the return of income.</li>
          <li>Cancellation charges shown is exclusive of all taxes and taxes will be added as per applicable.</li>
        </ul>
      </div>

      {/* Footer */}
      <div style={{ background: theme.primary, color: '#fff', borderRadius: 10, padding: 20, marginTop: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 15, borderBottom: '2px solid rgba(255,255,255,0.1)', paddingBottom: 15 }}>
          <img src="https://res.cloudinary.com/dcp1ev1uk/image/upload/v1724223770/logo_easm3q.png" alt="Logo" style={{ width: 70, height: 20, marginRight: 15 }} />
          <div>
            <div style={{ fontWeight: 700, fontSize: 24 }}>Pluto Tours & Travels</div>
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-around', marginBottom: 15 }}>
          <div style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
            <span style={{ marginRight: 8 }}>📍</span>
            <span style={{ fontSize: 12 }}>123 Tourism Street, Shimla, Himachal Pradesh</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', flex: 1, justifyContent: 'center' }}>
            <span style={{ marginRight: 8 }}>📞</span>
            <span style={{ fontSize: 12 }}>+91 98765 43210</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', flex: 1, justifyContent: 'flex-end' }}>
            <span style={{ marginRight: 8 }}>🌐</span>
            <span style={{ fontSize: 12 }}>www.plutotours.in</span>
          </div>
        </div>
        <div style={{ textAlign: 'center', color: '#CBD5E1', fontSize: 10, marginTop: 10 }}>
          © {new Date().getFullYear()} Pluto Tours & Travels. All rights reserved.
        </div>
      </div>
    </div>
  );
};

export default QuotePreviewDetails; 