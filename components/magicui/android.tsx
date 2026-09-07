import type { HTMLAttributes, ReactNode } from 'react'

const ANDROID_WIDTH = 433
const ANDROID_HEIGHT = 882

export interface AndroidProps extends HTMLAttributes<HTMLDivElement> {
  src?: string
  videoSrc?: string
  children?: ReactNode
}

export function Android({
  src,
  videoSrc,
  className,
  style,
  children,
  ...props
}: AndroidProps) {
  const hasVideo = !!videoSrc
  const hasMedia = hasVideo || !!src || !!children

  return (
    <div
      className={`relative inline-block w-full align-middle leading-none ${className ?? ''}`}
      style={{
        aspectRatio: `${ANDROID_WIDTH}/${ANDROID_HEIGHT}`,
        ...style,
      }}
      {...props}
    >
      {hasVideo && (
        <div
          className="pointer-events-none absolute z-0 overflow-hidden"
          style={{
            left: '2.5%',
            top: '2%',
            width: '95%',
            height: '96%',
            borderRadius: '32px',
          }}
        >
          <video
            className="block size-full object-cover"
            src={videoSrc}
            autoPlay
            loop
            muted
            playsInline
          />
        </div>
      )}

      {!hasVideo && src && (
        <div
          className="pointer-events-none absolute z-0 overflow-hidden"
          style={{
            left: '2.5%',
            top: '2%',
            width: '95%',
            height: '96%',
            borderRadius: '32px',
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt=""
            className="block size-full object-cover object-top"
          />
        </div>
      )}

      {!hasVideo && !src && children && (
        <div
          className="absolute z-0 overflow-hidden"
          style={{
            left: '2.5%',
            top: '2%',
            width: '95%',
            height: '96%',
            borderRadius: '32px',
          }}
        >
          {children}
        </div>
      )}

      <svg
        viewBox={`0 0 ${ANDROID_WIDTH} ${ANDROID_HEIGHT}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="pointer-events-none absolute inset-0 size-full"
        style={{ transform: 'translateZ(0)' }}
      >
        <g mask={hasMedia ? 'url(#androidScreenPunch)' : undefined}>
          <path
            d="M376 153H378C379.105 153 380 153.895 380 155V249C380 250.105 379.105 251 378 251H376V153Z"
            className="fill-[#444448] dark:fill-[#333336]"
          />
          <path
            d="M376 301H378C379.105 301 380 301.895 380 303V351C380 352.105 379.105 353 378 353H376V301Z"
            className="fill-[#444448] dark:fill-[#333336]"
          />
          <path
            d="M0 42C0 18.8041 18.804 0 42 0H336C359.196 0 378 18.804 378 42V788C378 811.196 359.196 830 336 830H42C18.804 830 0 811.196 0 788V42Z"
            className="fill-[#2B2B2E] dark:fill-[#1E1E20]"
          />
          <path
            d="M2 43C2 22.0132 19.0132 5 40 5H338C358.987 5 376 22.0132 376 43V787C376 807.987 358.987 825 338 825H40C19.0132 825 2 807.987 2 787V43Z"
            className="fill-[#0D0D0E]"
          />
        </g>

        {/* Camera punch hole */}
        <circle cx="189" cy="28" r="8" className="fill-black" />
        <circle cx="189" cy="28" r="3" className="fill-[#1F2937]" />

        <defs>
          <mask id="androidScreenPunch" maskUnits="userSpaceOnUse">
            <rect
              x="0"
              y="0"
              width={ANDROID_WIDTH}
              height={ANDROID_HEIGHT}
              fill="white"
            />
            <rect
              x="10"
              y="16"
              width="358"
              height="796"
              rx="32"
              ry="32"
              fill="black"
            />
          </mask>
        </defs>
      </svg>
    </div>
  )
}
