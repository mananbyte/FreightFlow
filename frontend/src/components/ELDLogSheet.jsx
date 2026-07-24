import React from 'react';
import './ELDLogSheet.css';

export default function ELDLogSheet({ day }) {
  if (!day) return null;

  const { date, intervals } = day;

  // SVG dimensions snapped for crisp integer math
  const width = 1120; // graphWidth (960) + 160 padding
  const height = 440; // graphHeight (240) + 200 padding
  const paddingLeft = 140;
  const paddingRight = 20;
  const paddingTop = 40;
  const paddingBottom = 160;
  
  const graphWidth = width - paddingLeft - paddingRight;
  const graphHeight = height - paddingTop - paddingBottom;
  const rowHeight = graphHeight / 4;
  
  const statuses = [
    { label: 'Off Duty', key: 'off_duty', bg: 'rgba(255, 255, 255, 0.4)', text: '#1d1d1f' },
    { label: 'Sleeper Berth', key: 'sleeper_berth', bg: 'transparent', text: '#1d1d1f' },
    { label: 'Driving', key: 'driving', bg: 'rgba(255, 255, 255, 0.4)', text: '#1d1d1f' },
    { label: 'On Duty', sub: '(Not Driving)', key: 'on_duty', bg: 'transparent', text: '#1d1d1f' }
  ];

  // Helper to map status to Y coordinate (center of the row)
  const getY = (status) => {
    const index = statuses.findIndex(s => s.key === status);
    return paddingTop + (index * rowHeight) + (rowHeight / 2);
  };

  // Helper to map timestamp to X coordinate
  const getX = (isoString) => {
    let localTimeStr = isoString;
    if (localTimeStr.includes('Z')) {
      localTimeStr = localTimeStr.replace('Z', '');
    } else {
      localTimeStr = localTimeStr.replace(/[+-]\d{2}:\d{2}$/, '');
    }
    
    const dateObj = new Date(`${localTimeStr}Z`);
    const dayStart = new Date(`${date}T00:00:00Z`);
    
    let elapsedMs = dateObj.getTime() - dayStart.getTime();
    const msInDay = 24 * 60 * 60 * 1000;
    
    // Cap between 0 and 24 hours to prevent overflowing the grid
    elapsedMs = Math.max(0, Math.min(msInDay, elapsedMs));
    
    const fraction = elapsedMs / msInDay;
    return paddingLeft + fraction * graphWidth;
  };

  // Helper to get color based on event type
  const getColor = (eventType) => {
    switch (eventType) {
      case 'pickup': return '#10B981';
      case 'dropoff': return '#EF4444';
      case 'fuel': return '#F59E0B';
      case 'break_30m': return '#FBBF24';
      case 'rest_10h': return '#3B82F6';
      case 'rest_34h': return '#8B5CF6';
      case 'driving': return '#111827';
      case 'off_duty': return '#111827';
      default: return '#111827';
    }
  };

  // Build a single continuous path for the event trace for perfect line joins
  let tracePath = '';
  if (intervals && intervals.length > 0) {
    intervals.forEach((interval, i) => {
      const startX = getX(interval.start_time);
      const endX = getX(interval.end_time);
      const y = getY(interval.status);

      if (i === 0) {
        tracePath += `M ${startX} ${y} L ${endX} ${y}`;
      } else {
        const prevY = getY(intervals[i - 1].status);
        if (prevY !== y) {
          tracePath += ` L ${startX} ${y}`; // vertical connector
        }
        tracePath += ` L ${endX} ${y}`; // horizontal segment
      }
    });
  }

  return (
    <div className="eld-log-sheet">
      <h3 className="log-date">{date}</h3>
      <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} className="log-svg">
        
        {/* Draw rows backgrounds (graph area only) and left labels */}
        {statuses.map((status, index) => {
          const y = paddingTop + index * rowHeight;
          const centerY = y + rowHeight / 2;
          return (
            <g key={`row-${index}`}>
              {status.bg !== 'transparent' && (
                <rect x={paddingLeft} y={y} width={graphWidth} height={rowHeight} fill={status.bg} rx={6} />
              )}
              <text x={paddingLeft - 20} y={status.sub ? centerY - 6 : centerY} fill={status.text} fontSize="13" fontWeight="600" fontFamily="-apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif" textAnchor="end" dominantBaseline="middle">
                {status.label}
              </text>
              {status.sub && (
                <text x={paddingLeft - 20} y={centerY + 8} fill="#86868b" fontSize="11" fontFamily="-apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif" textAnchor="end" dominantBaseline="middle">
                  {status.sub}
                </text>
              )}
            </g>
          );
        })}

        {/* Draw horizontal grid lines (only across graph area) */}
        {[0, 1, 2, 3, 4].map(i => {
          const y = paddingTop + i * rowHeight;
          return <line key={`hline-${i}`} x1={paddingLeft} y1={y} x2={width - paddingRight} y2={y} stroke="rgba(0, 0, 0, 0.2)" strokeWidth="1" />;
        })}

        {/* Draw vertical hour lines and tick marks */}
        {Array.from({ length: 25 }).map((_, h) => {
          const x = paddingLeft + (h / 24) * graphWidth;
          const isMidnight = h === 0 || h === 24;
          const isNoon = h === 12;
          
          let label = h % 12 === 0 ? 12 : h % 12;
          let ampm = h < 12 || h === 24 ? 'AM' : 'PM';
          let displayLabel = isMidnight || isNoon || h % 3 === 0 ? `${label} ${ampm}` : label;

          return (
            <g key={`h-${h}`}>
              <line x1={x} y1={paddingTop} x2={x} y2={paddingTop + graphHeight} stroke="rgba(0, 0, 0, 0.2)" strokeWidth="1" />
              <text x={x} y={paddingTop - 12} fill="#86868b" fontSize="11" fontWeight="500" textAnchor="middle">{displayLabel}</text>
              <text x={x} y={paddingTop + graphHeight + 24} fill="#86868b" fontSize="11" fontWeight="500" textAnchor="middle">{displayLabel}</text>
              
              {/* Tick marks */}
              {h < 24 && [1, 2, 3].map(q => {
                const tickX = x + (q / 4) * (graphWidth / 24);
                const isHalf = q === 2;
                return statuses.map((_, rIndex) => {
                  const rowBottom = paddingTop + (rIndex + 1) * rowHeight;
                  const tickHeight = isHalf ? rowHeight / 3 : rowHeight / 5;
                  return (
                    <line key={`tick-${h}-${q}-${rIndex}`} x1={tickX} y1={rowBottom} x2={tickX} y2={rowBottom - tickHeight} stroke="rgba(0, 0, 0, 0.15)" strokeWidth="1" />
                  );
                });
              })}
            </g>
          );
        })}

        {/* Draw the entire continuous event trace as a single path */}
        {tracePath && (
          <>
            {/* Soft glow for premium feel */}
            <path 
              d={tracePath} 
              fill="none" 
              stroke="#007AFF" 
              strokeWidth="10" 
              strokeLinejoin="round" 
              strokeLinecap="round"
              opacity="0.15"
              style={{ filter: 'blur(3px)' }}
            />
            {/* Main crisp event line */}
            <path 
              d={tracePath} 
              fill="none" 
              stroke="#007AFF" 
              strokeWidth="3.5" 
              strokeLinejoin="round" 
              strokeLinecap="round"
            />
          </>
        )}

        {/* REMARKS SECTION TITLE */}
        <text 
          x={paddingLeft - 20} 
          y={330} 
          fill="#007AFF" 
          fontSize="15" 
          fontWeight="700" 
          fontFamily="-apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif" 
          textAnchor="end"
          opacity="0.9"
        >
          REMARKS
        </text>

        {/* Draw Angled Remarks Lines */}
        {intervals && intervals.map((interval, i) => {
          const validEvents = ['pre_trip', 'post_trip', 'pickup', 'dropoff', 'fuel', 'break_30m', 'rest_10h', 'rest_34h', 'rest_2h', 'rest_8h'];
          if (!validEvents.includes(interval.event_type) && !interval.coordinates) {
            return null;
          }

          const startX = getX(interval.start_time);
          const endX = getX(interval.end_time);
          
          // y starts safely below the timeline numbers (which are around y=304)
          const yTop = 320; 
          
          const getEventLabel = (type) => {
            switch (type) {
              case 'pre_trip': return 'Pre-Trip/TIV';
              case 'post_trip': return 'Post-Trip/TIV';
              case 'pickup': return 'Pickup';
              case 'dropoff': return 'Delivery';
              case 'fuel': return 'Fuel Stop';
              case 'break_30m': return '30m Break';
              case 'rest_10h': return '10h Rest';
              case 'rest_34h': return '34h Restart';
              case 'rest_2h': return '2h Split';
              case 'rest_8h': return '8h Split';
              default: return type.replace('_', ' ');
            }
          };
          
          const remarkStr = getEventLabel(interval.event_type);
          const locStr = interval.coordinates ? `${interval.coordinates[1].toFixed(2)}, ${interval.coordinates[0].toFixed(2)}` : '';
          
          const isBracket = (interval.event_type === 'pre_trip' || interval.event_type === 'post_trip');

          // Ensure no overlap by staggering the drop based on 'i'
          const dropLength = 10 + (i % 3) * 22;
          const yMid = yTop + dropLength;
          const lineAngleLen = 25; // length of the angled segment
          
          if (isBracket) {
            const centerX = (startX + endX) / 2;
            return (
              <g key={`remark-${i}`}>
                {/* Bracket |___| dropping slightly */}
                <path d={`M ${startX} ${yTop-10} L ${startX} ${yTop} L ${endX} ${yTop} L ${endX} ${yTop-10}`} fill="none" stroke="#6B7280" strokeWidth="1.5" />
                {/* Vertical drop from center of bracket */}
                <path d={`M ${centerX} ${yTop} L ${centerX} ${yMid} L ${centerX - lineAngleLen} ${yMid + lineAngleLen}`} fill="none" stroke="#6B7280" strokeWidth="1.5" />
                {/* Rotated text */}
                <text 
                  x={centerX - lineAngleLen - 5} 
                  y={yMid + lineAngleLen + 4} 
                  fill="#374151" 
                  fontSize="11" 
                  fontFamily="-apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif" 
                  fontWeight="600"
                  transform={`rotate(-45 ${centerX - lineAngleLen - 5} ${yMid + lineAngleLen + 4})`}
                  textAnchor="end"
                >
                  {locStr ? `${locStr} • ` : ''}{remarkStr}
                </text>
              </g>
            );
          } else {
            // Normal event
            return (
              <g key={`remark-${i}`}>
                <path d={`M ${startX} ${yTop-10} L ${startX} ${yMid} L ${startX - lineAngleLen} ${yMid + lineAngleLen}`} fill="none" stroke="#6B7280" strokeWidth="1.5" />
                <text 
                  x={startX - lineAngleLen - 5} 
                  y={yMid + lineAngleLen + 4} 
                  fill="#374151" 
                  fontSize="11" 
                  fontFamily="-apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif" 
                  fontWeight="600"
                  transform={`rotate(-45 ${startX - lineAngleLen - 5} ${yMid + lineAngleLen + 4})`}
                  textAnchor="end"
                >
                  {locStr ? `${locStr} • ` : ''}{remarkStr}
                </text>
              </g>
            );
          }
        })}
      </svg>
    </div>
  );
}
