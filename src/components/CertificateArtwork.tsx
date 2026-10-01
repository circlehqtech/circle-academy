import { formatDate } from "../utils/dateTime";

interface CertificateArtworkProps {
  courseTitle: string;
  recipientName?: string;
  signatoryName?: string;
  signatoryTitle?: string;
  issuedAt?: string;
  certificateNumber?: string;
  backgroundUrl?: string;
  className?: string;
}

export function CertificateArtwork({
  courseTitle,
  recipientName = "Student name",
  signatoryName = "Authorized signatory",
  signatoryTitle = "Academy Director",
  issuedAt,
  certificateNumber,
  backgroundUrl,
  className = "",
}: CertificateArtworkProps) {
  return (
    <div
      className={`relative aspect-[1.414/1] overflow-hidden rounded-xl bg-[#f7f1e5] text-[#171310] @container ${className}`}
    >
      {backgroundUrl ? (
        <img
          className="absolute inset-0 h-full w-full object-cover"
          src={backgroundUrl}
          alt=""
        />
      ) : null}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_42%,rgba(255,255,255,.9),rgba(247,241,229,.76)_58%,rgba(226,211,180,.75))]" />
      <div className="absolute inset-y-0 left-0 w-[1.2cqw] bg-[#e11919]" />
      <div className="absolute inset-y-0 right-0 w-[0.55cqw] bg-[#c9a25e]" />
      <div className="absolute inset-[2.1cqw] border-[0.22cqw] border-[#b88a3a]" />
      <div className="absolute inset-[2.75cqw] border-[0.08cqw] border-[#251d16]/35" />
      <span className="absolute top-[2.1cqw] left-[2.1cqw] size-[3.4cqw] border-t-[0.55cqw] border-l-[0.55cqw] border-[#e11919]" />
      <span className="absolute right-[2.1cqw] bottom-[2.1cqw] size-[3.4cqw] border-r-[0.55cqw] border-b-[0.55cqw] border-[#e11919]" />

      <div className="relative flex h-full flex-col px-[6.4cqw] pt-[4.4cqw] pb-[4cqw]">
        <header className="flex items-center justify-between gap-[2cqw]">
          <div className="flex items-center gap-[1.5cqw] text-left">
            <img
              src="/circle_logo.png"
              alt="Circle HQ Emblem"
              className="size-[5.2cqw] object-contain drop-shadow-[0_0.4cqw_1cqw_rgba(225,25,25,0.25)]"
            />
            <span>
              <b className="block text-[1.85cqw] tracking-[0.03em] font-[750]">
                CIRCLE HQ ACADEMY
              </b>
              <small className="block text-[1.1cqw] tracking-[0.18em] text-[#776a5a] uppercase font-medium">
                Learning · Practice · Impact
              </small>
            </span>
          </div>
          <span className="rounded-full border border-[#b88a3a]/45 bg-white/45 px-[1.5cqw] py-[0.65cqw] text-[1.05cqw] font-bold tracking-[0.18em] text-[#7a5c26] uppercase">
            Certificate of completion
          </span>
        </header>

        <main className="flex flex-1 flex-col items-center justify-center text-center">
          <p className="text-[1.35cqw] tracking-[0.13em] text-[#726657] uppercase">
            This certificate is proudly presented to
          </p>
          <h2 className="mt-[1.15cqw] max-w-[85%] text-[5.3cqw] leading-[1.05] font-[760] tracking-[-0.045em] wrap-anywhere">
            {recipientName}
          </h2>
          <div className="my-[1.35cqw] flex items-center gap-[0.8cqw]">
            <span className="h-px w-[8cqw] bg-[#b88a3a]" />
            <span className="size-[0.72cqw] rotate-45 bg-[#e11919]" />
            <span className="h-px w-[8cqw] bg-[#b88a3a]" />
          </div>
          <p className="text-[1.3cqw] text-[#6e6254]">
            for successfully completing the course
          </p>
          <h3 className="mt-[0.75cqw] max-w-[88%] text-[2.8cqw] leading-tight font-[720] text-[#4d0000]">
            {courseTitle}
          </h3>
        </main>

        <footer className="grid grid-cols-[1fr_1.25fr_1fr] items-end gap-[2cqw] text-[1.05cqw]">
          <div className="text-left">
            <span className="block border-b border-[#292018]/40 pb-[0.55cqw] font-semibold">
              {issuedAt ? formatDate(issuedAt) : "Date awarded"}
            </span>
            <span className="mt-[0.45cqw] block text-[#766b5c]">
              Issue date
            </span>
          </div>
          <div className="text-center">
            <span className="block border-b border-[#292018]/40 pb-[0.55cqw] text-[1.55cqw] font-[650] italic">
              {signatoryName}
            </span>
            <span className="mt-[0.45cqw] block text-[#766b5c]">
              {signatoryTitle}
            </span>
          </div>
          <div className="flex justify-end">
            <span className="grid size-[8cqw] rotate-[-7deg] place-items-center rounded-full border-[0.4cqw] border-[#f0d59b] bg-[radial-gradient(circle_at_35%_28%,#f5dfad,#caa25c_58%,#8d692e)] p-[0.4cqw] text-center text-[0.88cqw] leading-[1.08] font-black tracking-[0.06em] text-[#4d0000] shadow-[0_0.8cqw_1.5cqw_rgba(75,48,10,.2)]">
              <div className="flex flex-col items-center">
                <img
                  src="/circle_logo.png"
                  alt=""
                  className="size-[2.6cqw] object-contain drop-shadow-[0_0.2cqw_0.4cqw_rgba(0,0,0,0.15)]"
                />
                <span>
                  CIRCLE HQ
                  <br />
                  VERIFIED
                </span>
              </div>
            </span>
          </div>
        </footer>
        <p className="absolute bottom-[1.25cqw] left-1/2 -translate-x-1/2 whitespace-nowrap text-[0.88cqw] tracking-[0.08em] text-[#857969]">
          {certificateNumber
            ? `Certificate ID · ${certificateNumber}`
            : "Official Circle HQ Academy credential"}
        </p>
      </div>
    </div>
  );
}
