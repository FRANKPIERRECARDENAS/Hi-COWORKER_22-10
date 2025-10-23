import Link from "next/link"

export default function NavButton({ icon, text, href, onClick }) {
  const content = (
    <>
      {icon}
      <p className="text-xs mt-1">{text}</p>
    </>
  )

  return (
    <div className="flex flex-col justify-center w-20 h-20 hover:bg-white/10 rounded-full transition-all duration-300">
      {href ? (
        <Link className="flex flex-col justify-center items-center text-white" href={href}>
          {content}
        </Link>
      ) : (
        <button className="flex flex-col justify-center items-center text-white" onClick={onClick}>
          {content}
        </button>
      )}
    </div>
  )
}