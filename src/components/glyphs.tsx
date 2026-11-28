import type { ReactNode } from 'react'
import type { ModuleId } from '../game/data'

/**
 * Icons in the style of the navigation bar: filled, very rounded, soft two-tone gradient with a small
 * gloss and no outlines. Thick round-cap strokes are only used where they read as a solid shape.
 * Every icon is painted three times with the same geometry: base colour, tone gradient, gloss.
 */
export type IconName =
  | 'check' | 'close' | 'play' | 'pause' | 'repeat' | 'lock' | 'eye' | 'eyeOff' | 'hand' | 'bluetooth' | 'bluetoothOff'
  | 'star' | 'pencil' | 'drop' | 'card' | 'book' | 'map' | 'user' | 'cap' | 'arrowRight' | 'arrowLeft' | 'backspace'
  | 'download' | 'turtle' | 'heart' | 'keyboard' | 'refresh' | 'sparkle' | 'flame' | 'info' | 'exit'
  | 'chevronDown' | 'chevronRight' | 'chevronLeft' | 'cloud' | 'trophy' | 'clock' | 'calendar' | 'chart' | 'growth'

const R = { strokeLinecap: 'round', strokeLinejoin: 'round', fill: 'none' } as const

/** Each icon receives the paint to use (currentColor, tone gradient or gloss gradient). */
const PATHS: Record<IconName, (f: string) => ReactNode> = {
  check: (f) => <path d="M5.4 12.9l4.5 4.5 8.7-9.8" {...R} stroke={f} strokeWidth={4.6} />,
  close: (f) => <path d="M6.6 6.6l10.8 10.8M17.4 6.6L6.6 17.4" {...R} stroke={f} strokeWidth={4.4} />,
  play: (f) => <path d="M8.2 5.6v12.8c0 .8.9 1.3 1.6.9l10-6.4c.6-.4.6-1.4 0-1.8l-10-6.4c-.7-.4-1.6.1-1.6.9z" fill={f} stroke={f} strokeWidth={1.6} strokeLinejoin="round" />,
  pause: (f) => (
    <>
      <rect x="5.6" y="4.5" width="5" height="15" rx="2.5" fill={f} />
      <rect x="13.4" y="4.5" width="5" height="15" rx="2.5" fill={f} />
    </>
  ),
  repeat: (f) => (
    <>
      <path d="M19 12a7 7 0 1 1-2.2-5.1" {...R} stroke={f} strokeWidth={3.6} />
      <path d="M21 2.8v8h-8z" fill={f} stroke={f} strokeWidth={1.4} strokeLinejoin="round" />
    </>
  ),
  lock: (f) => (
    <g transform="translate(12 12) scale(0.3) translate(-65.5 -58)">
      <path
        d="M72.5 25C79.4036 25 85 30.5964 85 37.5V49.2002C89.5645 50.1267 93 54.1621 93 59V81C93 86.5228 88.5228 91 83 91H48C42.4772 91 38 86.5228 38 81V59C38 53.8147 41.9467 49.5515 47 49.0498V37.5C47 30.5964 52.5964 25 59.5 25H72.5ZM64 63C62.3431 63 61 64.3431 61 66V68.25C61 69.3972 61.6446 70.3928 62.5908 70.8975C62.5343 71.0028 62.5 71.1221 62.5 71.25V77.25C62.5 77.6642 62.8358 78 63.25 78H67.75C68.1642 78 68.5 77.6642 68.5 77.25V71.25C68.5 71.1219 68.4648 71.0029 68.4082 70.8975C69.3548 70.3929 70 69.3975 70 68.25V66C70 64.3431 68.6569 63 67 63H64ZM61.3418 32C56.7348 32.0002 53.0002 35.7348 53 40.3418V48.6846H78.3604V40.3418C78.3602 35.7347 74.6247 32 70.0176 32H61.3418Z"
        fill={f}
      />
    </g>
  ),
  eye: (f) => (
    <>
      <path d="M2.5 12c1.7-4 5.3-7 9.5-7s7.8 3 9.5 7c-1.7 4-5.3 7-9.5 7s-7.8-3-9.5-7z" stroke={f} strokeWidth={2.4} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="12" r="3.2" fill={f} />
    </>
  ),
  eyeOff: (f) => (
    <>
      <path d="M12 5c4.8 0 8.6 3 10.2 7-1.6 4-5.4 7-10.2 7S3.4 16 1.8 12C3.4 8 7.2 5 12 5z" fill={f} />
      <circle cx="12" cy="12" r="3.4" fill="#fff" />
      <path d="M4 20L20 4" stroke="#fff" strokeWidth={6.4} strokeLinecap="round" />
      <path d="M4 20L20 4" {...R} stroke={f} strokeWidth={3} />
    </>
  ),
  hand: (f) => (
    <g transform="translate(0.38 -0.92) scale(0.03506)">
      <path
        d="M 270.5 74 L 292.5 77 L 305.5 84 L 321 97 Q 319.9 99.7 322.5 99 L 325 103 L 329 105.5 Q 328.3 107.8 330.5 107 L 333 111 L 337 113.5 Q 336.3 115.8 338.5 115 L 341 119 L 345 121.5 Q 344.3 123.8 346.5 123 L 349 127 L 353 129.5 Q 352.3 131.8 354.5 131 L 357 135 L 361 137.5 Q 360.3 139.8 362.5 139 L 365 143 L 369 145.5 L 371 148.5 L 384 164 L 387 165.5 L 393 175 Q 395.7 173.9 395 176.5 Q 399.4 178.9 400 184 L 403 185.5 L 422 214.5 L 417.5 220 Q 415.3 219.3 416 221.5 L 412 224 L 409.5 228 Q 407.3 227.3 408 229.5 L 404 232 L 401.5 236 Q 399.3 235.3 400 237.5 L 396 240 L 394.5 243 L 392.5 243 L 388 238.5 L 388 236.5 L 376 218.5 L 365 205.5 L 363 201 Q 360.3 202.1 361 199.5 L 352 188 L 349 186.5 L 346.5 183 Q 344.3 183.8 345 181.5 L 335 169 L 331 166.5 Q 331.8 164.3 329.5 165 L 327 161 L 323 158.5 Q 323.8 156.3 321.5 157 L 319 153 L 315 150.5 Q 315.8 148.3 313.5 149 L 311 145 L 307 142.5 Q 307.8 140.3 305.5 141 L 303 137 L 299 134.5 Q 299.8 132.3 297.5 133 L 279.5 116 L 267.5 116 L 265 117 Q 266.1 119.7 263.5 119 Q 257.4 122.4 259 133.5 L 265 143 L 269 145.5 Q 268.3 147.8 270.5 147 L 273 151 L 274.5 151 L 303.5 180 L 307 181 L 315 192.5 L 316 202.5 Q 314.1 211.6 307.5 216 Q 302.5 222 289.5 220 L 280.5 215 L 252.5 187 L 251 187 Q 252.1 184.3 249.5 185 L 247 181 L 243 178.5 Q 243.8 176.3 241.5 177 L 239 173 L 235 170.5 Q 235.8 168.3 233.5 169 L 231 165 L 227 162.5 Q 227.8 160.3 225.5 161 L 223 157 L 219 154.5 Q 219.8 152.3 217.5 153 L 215 149 L 211 146.5 Q 211.8 144.3 209.5 145 L 207 141 L 205.5 141 L 196.5 132 L 189.5 129 L 185.5 129 L 176 134.5 Q 171.5 138 173 147.5 L 177 155 L 181 157.5 Q 180.3 159.8 182.5 159 L 211.5 188 L 215 189 L 217.5 193 Q 219.8 192.3 219 194.5 L 223 197 L 225.5 201 Q 227.8 200.3 227 202.5 L 231 205 L 233.5 209 Q 235.8 208.3 235 210.5 L 239 213 L 243 220.5 L 244 231.5 L 239 243 L 229.5 248 L 217.5 248 L 210.5 244 L 160.5 195 L 159 195 Q 160.1 192.3 157.5 193 L 155 189 L 151 186.5 Q 151.8 184.3 149.5 185 L 147 181 L 143 178.5 Q 143.8 176.3 141.5 177 L 139 173 L 135 170.5 Q 135.8 168.3 133.5 169 L 131 165 L 127 162.5 Q 127.8 160.3 125.5 161 L 118.5 157 L 114.5 157 L 105 161 L 101 169.5 L 101 173.5 L 105 181.5 L 116.5 193 L 123 197 L 125.5 201 Q 127.8 200.3 127 202.5 L 131 205 L 133.5 209 Q 135.8 208.3 135 210.5 L 139 213 L 141.5 217 L 144 218.5 Q 143.3 220.8 145.5 220 L 148 224 L 152 226.5 Q 151.3 228.8 153.5 228 L 156 232 L 160 234.5 Q 159.3 236.8 161.5 236 L 164 240 L 168 242.5 Q 167.3 244.8 169.5 244 L 172 248 L 176 250.5 Q 175.3 252.8 177.5 252 L 180 256 L 183 257.5 L 187 265.5 L 187 275.5 L 181.5 284 Q 179.3 283.3 180 285.5 Q 174.3 290.8 163.5 291 L 152 285.5 Q 152.8 283.3 150.5 284 L 148 280 L 144 277.5 Q 144.8 275.3 142.5 276 L 140 272 L 136 269.5 Q 136.8 267.3 134.5 268 L 132 264 L 128 261.5 Q 128.8 259.3 126.5 260 L 124 256 L 120 253.5 Q 120.8 251.3 118.5 252 L 93.5 228 L 81.5 228 L 76 232 L 72 241.5 L 73 246.5 L 76 252 L 80 254.5 Q 79.3 256.8 81.5 256 L 84 260 L 88 262.5 Q 87.3 264.8 89.5 264 L 92 268 L 96 270.5 Q 95.3 272.8 97.5 272 L 100 276 L 101.5 276 L 126.5 301 L 128 301 Q 126.9 303.7 129.5 303 L 155.5 329 L 157 329 Q 155.9 331.7 158.5 331 L 161 335 L 165 337.5 Q 164.3 339.8 166.5 339 L 169 343 L 173 345.5 Q 172.3 347.8 174.5 347 L 177 351 L 181 353.5 Q 180.3 355.8 182.5 355 L 185 359 L 189 361.5 L 194 370.5 L 194 379.5 L 191 386.5 L 185.5 392 L 181.5 395 L 176.5 396 L 143.5 396 L 138.5 399 L 133.5 400 L 127 405.5 Q 127.8 407.8 125.5 407 L 120 413.5 L 116 422.5 L 116 431.5 L 117 434 L 129.5 433 L 130.5 432 L 146.5 432 L 156.5 430 L 190.5 429 L 194 430 L 195 438.5 L 192 452.5 L 192 465.5 L 189.5 471 L 138.5 472 L 127.5 475 L 112.5 476 L 101.5 479 L 93.5 476 L 89.5 476 L 79 466.5 L 74 454.5 L 74 424.5 L 76 419.5 L 77 407.5 L 85 391.5 L 90.5 384 Q 92.8 384.8 92 382.5 Q 104.4 367.2 124 360 L 125 357.5 L 104.5 336 L 101 335 L 98.5 331 Q 96.3 331.8 97 329.5 L 93 327 L 90.5 323 Q 88.3 323.8 89 321.5 L 85 319 L 82.5 315 Q 80.3 315.8 81 313.5 L 76 309.5 Q 76.8 307.3 74.5 308 L 72 304 L 68 301.5 Q 68.8 299.3 66.5 300 L 64 296 L 60 293.5 Q 60.8 291.3 58.5 292 L 56 288 L 52 285.5 Q 52.8 283.3 50.5 284 L 48 280 L 44 277.5 L 37 267.5 L 35 260.5 L 33 258.5 L 32 254.5 L 32 229.5 L 36 221.5 L 36 217.5 L 42.5 208 Q 44.8 208.8 44 206.5 L 52 200 L 53.5 197 Q 60 195.5 63 190.5 Q 57.9 180.1 60 162.5 L 64 149.5 L 73 135 Q 75.7 136.1 75 133.5 L 86.5 124 L 94.5 120 L 97.5 120 L 103.5 117 L 121.5 116 L 134.5 120 L 152.5 100 L 166.5 92 Q 172.5 92 175.5 89 L 193.5 88 L 208.5 92 L 218.5 97 L 221.5 100 L 225.5 100 L 239.5 85 L 254.5 77 L 270.5 74 Z  M 458.5 230 L 474.5 233 L 484 241.5 L 491 253.5 L 491 265.5 L 485.5 276 Q 483.3 275.3 484 277.5 L 465.5 296 L 464 296 L 461.5 300 Q 459.3 299.3 460 301.5 L 456 304 L 453.5 308 Q 451.3 307.3 452 309.5 L 448 312 L 445.5 316 Q 443.3 315.3 444 317.5 L 440 320 L 437.5 324 Q 435.3 323.3 436 325.5 L 432 328 L 429.5 332 Q 427.3 331.3 428 333.5 L 424 336 L 421.5 340 Q 419.3 339.3 420 341.5 L 415 345.5 Q 415.8 347.8 413.5 347 L 411 351 L 407 353.5 Q 407.8 355.8 405.5 355 L 403 359 L 399 361.5 Q 399.8 363.8 397.5 363 L 395 367 L 391 369.5 Q 391.8 371.8 389.5 371 L 384 378.5 L 384 384.5 L 388 392 L 394.5 396 L 404.5 396 L 409.5 393 L 434.5 368 L 436 368 L 438.5 364 Q 440.8 364.8 440 362.5 L 444 360 L 446.5 356 Q 448.8 356.8 448 354.5 L 452 352 L 454.5 348 Q 456.8 348.8 456 346.5 L 460 344 L 462.5 340 Q 464.8 340.8 464 338.5 L 468 336 L 470.5 332 Q 472.8 332.8 472 330.5 L 476 328 L 478.5 324 Q 480.8 324.8 480 322.5 L 485 318.5 Q 484.3 316.3 486.5 317 L 489 313 L 493 310.5 Q 492.3 308.3 494.5 309 L 497 305 L 501 302.5 Q 500.3 300.3 502.5 301 L 505 297 L 509 294.5 Q 508.3 292.3 510.5 293 L 527.5 277 L 534.5 273 Q 540 270.5 549.5 272 Q 561.7 275.3 568 284.5 L 572 290.5 L 574 303.5 L 571 314.5 L 551.5 335 L 521.5 364 L 520 364 L 517.5 368 Q 515.3 367.3 516 369.5 L 512 372 L 509.5 376 Q 507.3 375.3 508 377.5 L 504 380 L 501.5 384 Q 499.3 383.3 500 385.5 L 496 388 L 493.5 392 Q 491.3 391.3 492 393.5 L 488 396 L 485.5 400 Q 483.3 399.3 484 401.5 L 480 404 L 477.5 408 Q 475.3 407.3 476 409.5 L 471 413.5 Q 471.8 415.8 469.5 415 L 467 419 L 463 421.5 Q 463.8 423.8 461.5 423 L 459 427 L 455 429.5 L 452 434.5 L 452 442.5 L 456 449 L 460.5 452 L 467.5 453 L 472.5 452 L 477.5 449 L 490.5 436 L 492 436 L 494.5 432 Q 496.8 432.8 496 430.5 L 500 428 L 502.5 424 Q 504.8 424.8 504 422.5 L 508 420 L 510.5 416 Q 512.8 416.8 512 414.5 L 516 412 L 518.5 408 Q 520.8 408.8 520 406.5 L 524 404 L 526.5 400 Q 528.8 400.8 528 398.5 L 532 396 L 534.5 392 Q 536.8 392.8 536 390.5 L 540 388 L 541.5 385 L 545 382.5 Q 544.3 380.3 546.5 381 L 549 377 L 553 374.5 Q 552.3 372.3 554.5 373 L 557 369 L 561 366.5 Q 560.3 364.3 562.5 365 L 565 361 L 573.5 356 L 576.5 356 L 582.5 353 L 590.5 353 Q 601.1 355.9 608 362.5 L 609.5 365 Q 611.8 364.3 611 366.5 Q 618.2 373.3 616 389.5 L 611 399.5 L 595.5 415 L 569.5 440 L 568 440 L 565.5 444 Q 563.3 443.3 564 445.5 L 560 448 L 557.5 452 Q 555.3 451.3 556 453.5 L 552 456 L 549.5 460 Q 547.3 459.3 548 461.5 L 544 464 L 541.5 468 Q 539.3 467.3 540 469.5 L 536 472 L 533.5 476 Q 531.3 475.3 532 477.5 L 528 480 L 525.5 484 Q 523.3 483.3 524 485.5 L 520 488 L 518.5 491 L 515 493.5 Q 515.8 495.8 513.5 495 L 511 499 L 507 501.5 Q 501.7 505.2 503 515.5 Q 504.4 521.6 509.5 524 Q 513.1 526.9 520.5 526 L 526.5 524 L 536 516 L 538.5 512 Q 540.8 512.8 540 510.5 L 544 508 L 546.5 504 Q 548.8 504.8 548 502.5 L 552 500 L 554.5 496 Q 556.8 496.8 556 494.5 L 560 492 L 562.5 488 Q 564.8 488.8 564 486.5 L 568 484 L 570.5 480 Q 572.8 480.8 572 478.5 L 576 476 L 578.5 472 L 581 470.5 Q 580.3 468.3 582.5 469 L 590.5 464 L 605.5 463 Q 620 466.5 627 477.5 L 631 489.5 L 631 494.5 L 628 504.5 L 625.5 508 Q 623.3 507.3 624 509.5 L 616 516 L 613.5 520 Q 611.3 519.3 612 521.5 L 608 524 L 605.5 528 Q 603.3 527.3 604 529.5 L 600 532 L 597.5 536 Q 595.3 535.3 596 537.5 L 592 540 L 589.5 544 Q 587.3 543.3 588 545.5 L 584 548 L 581.5 552 Q 579.3 551.3 580 553.5 L 576 556 L 573.5 560 Q 571.3 559.3 572 561.5 L 567 565.5 Q 567.8 567.8 565.5 567 L 557 573 Q 558.1 575.7 555.5 575 L 544 584 L 542.5 587 L 533 593 Q 534.1 595.7 531.5 595 Q 529 599.5 524 600 L 522.5 603 L 475.5 634 L 455.5 644 L 442.5 648 L 438.5 651 Q 430.5 651 426.5 655 L 415.5 656 L 409.5 659 L 393.5 660 L 376.5 663 L 359.5 663 L 347.5 660 L 333.5 659 L 331.5 657 L 319.5 655 L 315.5 652 L 303.5 648 L 281.5 636 L 259 619 Q 260.1 616.3 257.5 617 L 255 613 L 251 610.5 L 249 607.5 L 237 593.5 L 236 589.5 L 233 586.5 L 225 571.5 Q 224.7 564.3 221 560.5 L 219 546.5 L 217 541.5 L 217 505.5 L 220 489.5 L 221 461.5 L 224 449.5 L 224 430.5 L 225 429.5 L 225 415.5 L 226 414.5 L 226 402.5 L 227 401.5 L 227 378.5 L 226 377.5 L 224 340.5 L 221 330.5 L 220 317.5 L 217 310.5 L 217 300.5 L 221 292 L 224 290.5 Q 223.3 288.3 225.5 289 L 232.5 285 L 248.5 285 Q 254.2 288.8 263.5 289 L 277.5 296 L 296 312.5 L 307 327.5 L 313 347 L 323.5 351 L 329.5 348 L 386.5 292 L 388 292 L 390.5 288 Q 392.8 288.8 392 286.5 L 396 284 L 398.5 280 Q 400.8 280.8 400 278.5 L 404 276 L 406.5 272 Q 408.8 272.8 408 270.5 L 412 268 L 414.5 264 Q 416.8 264.8 416 262.5 L 420 260 L 422.5 256 Q 424.8 256.8 424 254.5 L 428 252 L 430.5 248 Q 432.8 248.8 432 246.5 L 437 242.5 Q 436.3 240.3 438.5 241 L 441 237 L 450.5 232 L 458.5 230 Z "
        fill={f}
      />
    </g>
  ),
  bluetooth: (f) => <path d="M7 7.6l10 9-5 4.4V3l5 4.4-10 9" {...R} stroke={f} strokeWidth={3.2} />,
  bluetoothOff: (f) => (
    <>
      <path d="M7 7.6l10 9-5 4.4V3l5 4.4-10 9" {...R} stroke={f} strokeWidth={3.2} />
      <path d="M3.5 3.5l17 17" stroke="#fff" strokeWidth={6.4} strokeLinecap="round" />
      <path d="M3.5 3.5l17 17" {...R} stroke={f} strokeWidth={3} />
    </>
  ),
  star: (f) => <path d="M12 2.8l2.7 5.6 6.1.8-4.5 4.2 1.1 6.1L12 16.5l-5.4 3 1.1-6.1-4.5-4.2 6.1-.8z" fill={f} stroke={f} strokeWidth={2.6} strokeLinejoin="round" />,
  pencil: (f) => <path d="M3 17.4V21h3.6L17.7 9.9 14.1 6.3 3 17.4zM20.6 7a1 1 0 0 0 0-1.4l-2.2-2.2a1 1 0 0 0-1.4 0l-1.8 1.8 3.6 3.6L20.6 7z" fill={f} stroke={f} strokeWidth={1} strokeLinejoin="round" />,
  drop: (f) => <path d="M12 2.4c3.5 4.1 6.6 7 6.6 11a6.6 6.6 0 0 1-13.2 0c0-4 3.1-6.9 6.6-11z" fill={f} />,
  card: (f) => (
    <>
      <rect x="2.5" y="4.5" width="19" height="15" rx="4.6" fill={f} />
      <rect x="6.2" y="8.6" width="8" height="2.4" rx="1.2" fill="#fff" />
      <rect x="6.2" y="13" width="11.6" height="2.4" rx="1.2" fill="#fff" />
    </>
  ),
  book: (f) => (
    <>
      <path d="M12 6.4C9.6 4.7 6.2 4.4 2.8 5.2v13.1c3.4-.8 6.8-.5 9.2 1.3 2.4-1.8 5.8-2.1 9.2-1.3V5.2c-3.4-.8-6.8-.5-9.2 1.2z" fill={f} stroke={f} strokeWidth={1.4} strokeLinejoin="round" />
      <rect x="11.1" y="6.6" width="1.8" height="12.8" fill="#fff" />
    </>
  ),
  map: (f) => (
    <>
      <path d="M2.8 6.6l6-2.6 6.4 2.6 6-2.6v13.4l-6 2.6-6.4-2.6-6 2.6z" fill={f} stroke={f} strokeWidth={1.4} strokeLinejoin="round" />
      <path d="M8.8 4.4v13M15.2 6.8v13" stroke="#fff" strokeWidth={1.6} />
    </>
  ),
  user: (f) => (
    <>
      <circle cx="12" cy="7.8" r="4.8" fill={f} />
      <path d="M3.4 21.2c0-4.8 3.8-7.6 8.6-7.6s8.6 2.8 8.6 7.6z" fill={f} stroke={f} strokeWidth={1.2} strokeLinejoin="round" />
    </>
  ),
  cap: (f) => (
    <>
      <path d="M12 3.2L1.6 8.6 12 14l8.4-4.4v5.9h2V8.6z" fill={f} stroke={f} strokeWidth={1} strokeLinejoin="round" />
      <path d="M5.4 12.4v4.2c0 1.6 3 3.4 6.6 3.4s6.6-1.8 6.6-3.4v-4.2L12 15.8z" fill={f} />
    </>
  ),
  arrowRight: (f) => <path d="M4.6 12h13.6M12.6 5.8l6.2 6.2-6.2 6.2" {...R} stroke={f} strokeWidth={3.8} />,
  arrowLeft: (f) => <path d="M19.4 12H5.8M11.4 5.8L5.2 12l6.2 6.2" {...R} stroke={f} strokeWidth={3.8} />,
  chevronDown: (f) => <path d="M5.8 9l6.2 6.2L18.2 9" {...R} stroke={f} strokeWidth={4.2} />,
  chevronRight: (f) => <path d="M9 5.8l6.2 6.2L9 18.2" {...R} stroke={f} strokeWidth={4.2} />,
  chevronLeft: (f) => <path d="M15 5.8L8.8 12l6.2 6.2" {...R} stroke={f} strokeWidth={4.2} />,
  backspace: (f) => (
    <>
      <path d="M8.8 4.8H19a2.2 2.2 0 0 1 2.2 2.2v10a2.2 2.2 0 0 1-2.2 2.2H8.8L2.4 12z" fill={f} stroke={f} strokeWidth={1.6} strokeLinejoin="round" />
      <path d="M11.6 9.4l5 5M16.6 9.4l-5 5" stroke="#fff" strokeWidth={2.2} strokeLinecap="round" />
    </>
  ),
  download: (f) => (
    <>
      <path d="M12 3.5v10M7.6 9.6l4.4 4.4 4.4-4.4" {...R} stroke={f} strokeWidth={3.6} />
      <rect x="3.5" y="16.4" width="17" height="4.6" rx="2.3" fill={f} />
    </>
  ),
  turtle: (f) => (
    <>
      <path d="M3.6 16.6a8.4 7.4 0 0 1 16.8 0z" fill={f} />
      <circle cx="21" cy="13.4" r="2.6" fill={f} />
      <rect x="5.4" y="15.4" width="3.2" height="5" rx="1.6" fill={f} />
      <rect x="14.6" y="15.4" width="3.2" height="5" rx="1.6" fill={f} />
    </>
  ),
  heart: (f) => <path d="M12 21c-.5 0-1-.2-1.4-.5C6 16.6 2.5 13.4 2.5 9.3 2.5 6.4 4.7 4.3 7.4 4.3c1.9 0 3.5 1 4.6 2.6 1.1-1.6 2.7-2.6 4.6-2.6 2.7 0 4.9 2.1 4.9 5 0 4.1-3.5 7.3-8.1 11.2-.4.3-.9.5-1.4.5z" fill={f} />,
  keyboard: (f) => (
    <>
      <rect x="2" y="5.5" width="20" height="13" rx="4" fill={f} />
      <path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M7 14.4h10" stroke="#fff" strokeWidth={2.2} strokeLinecap="round" />
    </>
  ),
  refresh: (f) => (
    <>
      <path d="M19.4 12a7.4 7.4 0 1 1-2.3-5.3" {...R} stroke={f} strokeWidth={3.6} />
      <path d="M21 2.8v8h-8z" fill={f} stroke={f} strokeWidth={1.4} strokeLinejoin="round" />
    </>
  ),
  sparkle: (f) => <path d="M12 2.2c.7 4.6 2.2 6.8 7.8 7.8-5.6 1-7.1 3.2-7.8 7.8-.7-4.6-2.2-6.8-7.8-7.8 5.6-1 7.1-3.2 7.8-7.800zM19 15.600c.3 1.9.9 2.8 3 3.2-2.1.4-2.7 1.3-3 3.2-.3-1.9-.9-2.8-3-3.2 2.1-.4 2.7-1.3 3-3.200z" fill={f} stroke={f} strokeWidth={0.8} strokeLinejoin="round" />,
  flame: (f) => <path d="M12.6 2.400c.5 3.2-1.3 4.7-2.9 6.600C8.1 10.8 6.5 12.8 6.5 15.500a5.5 5.5 0 0 0 11 0c0-2.2-1-3.8-2.1-5.1-.2 1.3-.8 2.2-1.7 2.7.6-3.8-.1-7.9-1.1-10.700z" fill={f} stroke={f} strokeWidth={1} strokeLinejoin="round" />,
  info: (f) => (
    <>
      <circle cx="12" cy="12" r="10" fill={f} />
      <rect x="10.8" y="10.6" width="2.4" height="6.4" rx="1.2" fill="#fff" />
      <circle cx="12" cy="7.6" r="1.5" fill="#fff" />
    </>
  ),
  exit: (f) => (
    <>
      <path d="M4 6.4A3.4 3.4 0 0 1 7.4 3H12v3.200H7.200v11.600H12V21H7.400A3.4 3.4 0 0 1 4 17.600z" fill={f} />
      <path d="M10.2 12H20M16.4 8l4 4-4 4" {...R} stroke={f} strokeWidth={3.4} />
    </>
  ),
  cloud: (f) => <path d="M7 19a4.6 4.6 0 0 1-.6-9.100A6 6 0 0 1 18 9.6 4.7 4.7 0 0 1 17.4 19z" fill={f} stroke={f} strokeWidth={1.2} strokeLinejoin="round" />,
  trophy: (f) => (
    <>
      <path d="M7 3.500h10v5.200a5 5 0 0 1-10 0z" fill={f} />
      <path d="M7 5H3.800v1.600A3.4 3.4 0 0 0 7.2 10M17 5h3.200v1.600A3.4 3.4 0 0 1 16.8 10" {...R} stroke={f} strokeWidth={2.2} />
      <rect x="10.6" y="12.8" width="2.8" height="4" fill={f} />
      <rect x="7.4" y="16.4" width="9.2" height="4.2" rx="2.1" fill={f} />
    </>
  ),
  clock: (f) => (
    <>
      <circle cx="12" cy="12" r="10" fill={f} />
      <path d="M12 6.600V12l3.6 2.2" {...R} stroke="#fff" strokeWidth={2.4} />
    </>
  ),
  calendar: (f) => (
    <>
      <rect x="3" y="4.6" width="18" height="16.4" rx="4.4" fill={f} />
      <rect x="6.8" y="2.4" width="2.6" height="5" rx="1.3" fill={f} />
      <rect x="14.6" y="2.4" width="2.6" height="5" rx="1.3" fill={f} />
      <rect x="6.6" y="11" width="4" height="3.2" rx="1.2" fill="#fff" />
      <rect x="13.4" y="11" width="4" height="3.2" rx="1.2" fill="#fff" />
      <rect x="6.6" y="15.8" width="4" height="3" rx="1.2" fill="#fff" />
    </>
  ),
  chart: (f) => (
    <>
      <rect x="3.6" y="12.6" width="4.6" height="8" rx="1.8" fill={f} />
      <rect x="9.7" y="8" width="4.6" height="12.6" rx="1.8" fill={f} />
      <rect x="15.8" y="4" width="4.6" height="16.6" rx="1.8" fill={f} />
    </>
  ),
  growth: (f) => (
    <>
      <ellipse cx="12" cy="13.8" rx="6.8" ry="8.2" fill={f} />
      <path d="M8 13.400l2.4-2 2 2 2-2 2.4 2" {...R} stroke="#fff" strokeWidth={1.8} />
    </>
  ),
}

/** Defs shared by every icon. Rendered once at the app root. */
export function IconDefs() {
  return (
    <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden>
      <defs>
        <linearGradient id="ico-tone" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity=".34" />
          <stop offset=".5" stopColor="#fff" stopOpacity="0" />
          <stop offset="1" stopColor="#7A1F00" stopOpacity=".2" />
        </linearGradient>
        <radialGradient id="ico-gloss" cx=".3" cy=".2" r=".42">
          <stop offset="0" stopColor="#fff" stopOpacity=".6" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
        {/* keeps only the white pixels of a module asset and paints them grey (locked module casilla) */}
        <filter id="mod-glyph" colorInterpolationFilters="sRGB" x="0" y="0" width="100%" height="100%">
          <feColorMatrix type="matrix" values="0 0 0 0 .60  0 0 0 0 .65  0 0 0 0 .69  3.4 3.4 3.4 0 -9.2" />
        </filter>
      </defs>
    </svg>
  )
}

export function Icon({ name, size = 24, className = '', color, solid = false }: { name: IconName; size?: number; className?: string; color?: string; solid?: boolean }) {
  const P = PATHS[name]
  const paint = color || 'currentColor'
  const flat = solid || name === 'bluetooth' || name === 'bluetoothOff'
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={`shrink-0 ${className}`} style={color ? { color } : undefined} aria-hidden>
      {P(paint)}
      {!flat && P('url(#ico-tone)')}
      {!flat && P('url(#ico-gloss)')}
    </svg>
  )
}

/** Round badge with a thick lip in the accent colour (button effect) and a white filled symbol. */
export function Badge({ icon, color = '#FF8001', accent = '#FF4F1A', size = 40, className = '' }: { icon: IconName; color?: string; accent?: string; size?: number; className?: string }) {
  return (
    <span className={`inline-grid shrink-0 place-items-center rounded-full text-white ${className}`} style={{ width: size, height: size, background: `linear-gradient(160deg, ${color}, ${color})`, boxShadow: `0 ${Math.max(3, size * 0.1)}px 0 ${accent}`, marginBottom: Math.max(3, size * 0.1) }}>
      <Icon name={icon} size={size * 0.56} />
    </span>
  )
}

export type ShapeKind = 'circle' | 'triangle' | 'square'
export function Shape({ kind, size = 24, color = 'currentColor' }: { kind: ShapeKind; size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
      {kind === 'circle' && <circle cx={12} cy={12} r={8.6} fill={color} />}
      {kind === 'triangle' && <path d="M12 3.6L21.4 19.6H2.6Z" fill={color} stroke={color} strokeWidth={2.4} strokeLinejoin="round" />}
      {kind === 'square' && <rect x={3.8} y={3.8} width={16.4} height={16.4} rx={3.4} fill={color} />}
    </svg>
  )
}

/* ============================== module marks (design assets) ============================== */

const MW = 132
const MH = 143.571
const LABEL_FONT = "'Nunito:Black', 'Nunito', sans-serif"
const letterCss = (left: number, top: number, color: string) => ({
  position: 'absolute' as const, left, top, transform: 'translateX(-50%)', width: 93.7, height: 66.28, textAlign: 'center' as const,
  fontFamily: LABEL_FONT, fontWeight: 900, fontSize: 56.372, lineHeight: 'normal', color, userSelect: 'none' as const,
})
const GLYPH_CLIP = 'ellipse(30% 26% at 50% 40.6%)'

/**
 * Module mark exactly as in the attached frames: coloured disc, white edge, thick lip and the module icon
 * (Aa · drop · 1 · chat bubble · pencil). `locked` repaints it in grey with the icon in grey at 60 %.
 */
export function ModuleArt({ id, size = 60, locked = false, className = '' }: { id: ModuleId; size?: number; locked?: boolean; className?: string }) {
  const k = size / MW
  const img = (src: string, top: number, h: number, extra: object = {}) => (
    <img src={src} alt="" draggable={false} className="absolute" style={{ left: 0, top, width: MW, height: h, ...extra }} />
  )
  return (
    <span className={`relative inline-block shrink-0 ${className}`} style={{ width: size, height: MH * k }} aria-hidden>
      <span className="absolute top-0 left-0 origin-top-left" style={{ width: MW, height: MH, transform: `scale(${k})` }}>
        {locked ? (
          <>
            <svg width={MW} height={MH} viewBox={`0 0 ${MW} ${MH}`} className="absolute inset-0">
              <path d="M0 94.285V58.79L132 58.285V94.285S132 143.571 66 143.571 0 94.285 0 94.285z" fill="#CBCBCB" />
              <ellipse cx="66" cy="58.286" rx="66" ry="58.286" fill="#E4E4E4" />
              <ellipse cx="66" cy="58.286" rx="61" ry="53.3" fill="none" stroke="#fff" strokeWidth="10" />
            </svg>
            <span className="absolute inset-0" style={{ opacity: 0.6 }}>
              {id === 1 && <span style={letterCss(66.1, 17.14, '#9AA5B1')}>Aa</span>}
              {id === 3 && <span style={letterCss(65.9, 20, '#9AA5B1')}>1</span>}
              {id === 2 && img('/modules/m2.svg', 0, MH, { filter: 'url(#mod-glyph)', clipPath: GLYPH_CLIP })}
              {id === 4 && img('/modules/m4.svg', 0, MH, { filter: 'url(#mod-glyph)', clipPath: GLYPH_CLIP })}
              {id === 5 && img('/modules/m5.svg', 0, MH, { filter: 'url(#mod-glyph)', clipPath: GLYPH_CLIP })}
            </span>
          </>
        ) : (
          <>
            {id === 1 && (
              <>
                {img('/modules/m1-lip.svg', 58.29, 85.286)}
                {img('/modules/m1-circle.svg', 0, 116.571)}
                <span style={letterCss(66.1, 17.14, '#fff')}>Aa</span>
              </>
            )}
            {id === 2 && img('/modules/m2.svg', 0, MH)}
            {id === 3 && (
              <>
                {img('/modules/m3-lip.svg', 58.29, 85.286)}
                {img('/modules/m3-circle.svg', 0, 116.571)}
                <span style={letterCss(65.9, 20, '#fff')}>1</span>
              </>
            )}
            {id === 4 && img('/modules/m4.svg', 0, MH)}
            {id === 5 && img('/modules/m5.svg', 0, MH)}
          </>
        )}
      </span>
    </span>
  )
}

/* ============================== pictograms (flat, filled) ============================== */

const INK = '#4A5A8C'
function Face({ fill, children }: { fill: string; children: ReactNode }) {
  return (
    <>
      <circle cx="32" cy="32" r="27" fill={fill} />
      {children}
    </>
  )
}
const Eyes = ({ y = 27, r = 3.4 }: { y?: number; r?: number }) => (
  <>
    <circle cx="22.5" cy={y} r={r} fill={INK} />
    <circle cx="41.5" cy={y} r={r} fill={INK} />
  </>
)

const PICTO: Record<string, ReactNode> = {
  FELIZ: (
    <Face fill="#FFD93D">
      <Eyes />
      <path d="M17 36c3 11 27 11 30 0z" fill={INK} />
      <circle cx="15" cy="37" r="4" fill="#FF9E7A" opacity=".7" />
      <circle cx="49" cy="37" r="4" fill="#FF9E7A" opacity=".7" />
    </Face>
  ),
  TRISTE: (
    <Face fill="#8FD0FF">
      <Eyes y={28} />
      <path d="M21 45c4-6 18-6 22 0" fill="none" stroke={INK} strokeWidth="4" strokeLinecap="round" />
      <path d="M44 34c2 3 3 5 0 7-3-2-2-4 0-7z" fill="#fff" />
    </Face>
  ),
  ENOJADO: (
    <Face fill="#FF8A66">
      <Eyes y={30} r={3} />
      <path d="M16 20l11 5M48 20l-11 5" stroke={INK} strokeWidth="4.2" strokeLinecap="round" />
      <path d="M22 45c4-4 16-4 20 0" fill="none" stroke={INK} strokeWidth="4" strokeLinecap="round" />
    </Face>
  ),
  MIEDO: (
    <Face fill="#CDB8FF">
      <circle cx="22.5" cy="27" r="6.5" fill="#fff" />
      <circle cx="41.5" cy="27" r="6.5" fill="#fff" />
      <circle cx="22.5" cy="28" r="3" fill={INK} />
      <circle cx="41.5" cy="28" r="3" fill={INK} />
      <ellipse cx="32" cy="45" rx="5" ry="6.4" fill={INK} />
    </Face>
  ),
  CANSADO: (
    <Face fill="#FFC98B">
      <path d="M17 28c3 3 8 3 11 0M36 28c3 3 8 3 11 0" fill="none" stroke={INK} strokeWidth="3.6" strokeLinecap="round" />
      <ellipse cx="32" cy="44" rx="6" ry="5" fill={INK} />
      <text x="46" y="14" fontFamily="Nunito" fontWeight="900" fontSize="14" fill="#7B8AB0">z</text>
    </Face>
  ),
  AMO: <path d="M32 56C11 41 4 32 4 23c0-8 6-14 14-14 5 0 10 3 14 9 4-6 9-9 14-9 8 0 14 6 14 14 0 9-7 18-28 33z" fill="#FF6B8B" />,
  GRACIAS: (
    <>
      <path d="M10 30c0-6 4-10 10-10h24c6 0 10 4 10 10v6c0 10-8 18-22 18S10 46 10 36z" fill="#FFC98B" />
      <path d="M32 14c-5-6-14-2-14 5 0 6 8 10 14 15 6-5 14-9 14-15 0-7-9-11-14-5z" fill="#FF6B8B" />
    </>
  ),
  DIME: (
    <>
      <path d="M10 12h44a6 6 0 0 1 6 6v22a6 6 0 0 1-6 6H34L20 58V46h-10a6 6 0 0 1-6-6V18a6 6 0 0 1 6-6z" fill="#45C1FF" />
      <circle cx="22" cy="29" r="4" fill="#fff" />
      <circle cx="34" cy="29" r="4" fill="#fff" />
      <circle cx="46" cy="29" r="4" fill="#fff" />
    </>
  ),
  ABRAZO: <path d="M32 55C12 40 5 31 5 22c0-8 6-13 13-13 5 0 10 3 14 9 4-6 9-9 14-9 7 0 13 5 13 13 0 9-7 18-27 33z" fill="#FF6B8B" />,
  'GRACIAS / PERDÓN': (
    <>
      <path d="M24 50C8 38 3 31 3 24c0-6 4-10 10-10 4 0 8 2 11 7 3-5 7-7 11-7 6 0 10 4 10 10 0 7-5 14-21 26z" fill="#FF6B8B" />
      <path d="M44 56c-12-9-16-14-16-19 0-4 3-7 7-7 3 0 6 1 9 5 2-4 5-5 8-5 4 0 7 3 7 7 0 5-5 10-15 19z" transform="translate(-2 -4)" fill="#D06BFF" />
    </>
  ),
  HAMBRE: (
    <>
      <path d="M32 18c-6-6-20-3-20 13 0 14 9 24 16 24 3 0 3-1 4-1s1 1 4 1c7 0 16-10 16-24 0-16-14-19-20-13z" fill="#FF5A4F" />
      <path d="M32 18c0-6 2-10 7-12" fill="none" stroke="#7A4A1E" strokeWidth="4" strokeLinecap="round" />
      <path d="M36 14c6-8 16-4 14 2-6 4-12 2-14-2z" fill="#73D83A" />
    </>
  ),
  SED: (
    <>
      <path d="M13 8h38l-5 46a5 5 0 0 1-5 4H23a5 5 0 0 1-5-4z" fill="#CFEFFF" />
      <path d="M16 26h32l-3 28a5 5 0 0 1-5 4H24a5 5 0 0 1-5-4z" fill="#45C1FF" />
      <circle cx="32" cy="42" r="4" fill="#fff" opacity=".7" />
    </>
  ),
  SUEÑO: (
    <>
      <path d="M44 8a24 24 0 1 0 12 36A20 20 0 0 1 44 8z" fill="#FFD93D" />
      <path d="M40 10l2 5 5 2-5 2-2 5-2-5-5-2 5-2z" fill="#FFE44C" />
      <text x="44" y="30" fontFamily="Nunito" fontWeight="900" fontSize="16" fill="#8FA2D8">z</text>
      <text x="52" y="20" fontFamily="Nunito" fontWeight="900" fontSize="11" fill="#8FA2D8">z</text>
    </>
  ),
  BAÑO: (
    <>
      <rect x="16" y="6" width="32" height="20" rx="6" fill="#CFEFFF" />
      <path d="M10 28h44c0 14-8 24-22 24S10 42 10 28z" fill="#45C1FF" />
      <rect x="24" y="50" width="16" height="8" rx="3" fill="#9AA5B1" />
    </>
  ),
  AYUDA: (
    <>
      <path fillRule="evenodd" d="M32 6a26 26 0 1 1 0 52 26 26 0 0 1 0-52zm0 15a11 11 0 1 0 0 22 11 11 0 0 0 0-22z" fill="#FF5A4F" />
      <circle cx="32" cy="32" r="18.5" fill="none" stroke="#fff" strokeWidth="9" strokeDasharray="14.5 14.5" strokeDashoffset="7" />
    </>
  ),
  JUGAR: (
    <>
      <circle cx="32" cy="32" r="26" fill="#FF8001" />
      <path d="M32 6a26 26 0 0 1 22 40C40 46 30 36 32 6z" fill="#FFE44C" />
      <path d="M6 28C20 30 28 40 24 57A26 26 0 0 1 6 28z" fill="#45C1FF" />
      <circle cx="22" cy="18" r="5" fill="#fff" opacity=".5" />
    </>
  ),
  MAMÁ: (
    <>
      <path d="M13 30C9 8 55 8 51 30l3 14H10z" fill="#8A4B2A" />
      <circle cx="32" cy="29" r="14" fill="#F3C9A3" />
      <path d="M10 62c0-14 9-20 22-20s22 6 22 20z" fill="#FF8001" />
      <path d="M22 30c0-6 6-8 10-8s10 2 10 8c-5-3-15-3-20 0z" fill="#8A4B2A" />
    </>
  ),
  PAPÁ: (
    <>
      <circle cx="32" cy="27" r="14" fill="#F3C9A3" />
      <path d="M17 24c0-14 30-14 30 0-4-6-26-6-30 0z" fill="#3B2A20" />
      <path d="M10 62c0-14 9-20 22-20s22 6 22 20z" fill="#45C1FF" />
    </>
  ),
  NIDO: (
    <>
      <ellipse cx="24" cy="30" rx="9" ry="11" fill="#FFF1D6" />
      <ellipse cx="41" cy="29" rx="9" ry="11" fill="#FFE9BE" />
      <path d="M6 34c3 20 49 20 52 0z" fill="#B7793F" />
      <path d="M11 41l42-3M14 47l36-1" stroke="#8A5629" strokeWidth="3" strokeLinecap="round" />
    </>
  ),
  PAN: (
    <>
      <path d="M10 28c0-12 10-18 22-18s22 6 22 18c0 4-2 6-4 7v13c0 4-3 6-6 6H20c-3 0-6-2-6-6V35c-2-1-4-3-4-7z" fill="#E8A24A" />
      <path d="M22 18l-4 12M33 16l-4 14M44 18l-4 12" stroke="#FFD9A0" strokeWidth="4" strokeLinecap="round" />
    </>
  ),
  DEDO: (
    <>
      <rect x="25" y="4" width="13" height="30" rx="6.5" fill="#F3C9A3" />
      <path d="M14 34c0-4 3-6 7-6h26c6 0 11 4 11 10v8c0 10-8 16-18 16H30c-8 0-16-6-16-14z" fill="#F3C9A3" />
      <path d="M22 40v10M32 40v10M42 40v10" stroke="#E5A57E" strokeWidth="3" strokeLinecap="round" />
    </>
  ),
}

export const hasPictogram = (content: string) => content in PICTO || content === 'DINO'
export function Pictogram({ content, size = 48 }: { content: string; size?: number }) {
  if (content === 'DINO') return <img src="/spike/3-feliz.svg" alt="" width={size} height={size} style={{ objectFit: 'contain' }} />
  const art = PICTO[content]
  if (!art) return null
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden>
      {art}
    </svg>
  )
}
