function FloatingButton({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-8 right-8 h-14 w-14 rounded-full bg-gradient-to-br from-blue-400 to-cyan-400 text-white shadow-[0_0_30px_rgba(96,165,250,0.5)] hover:shadow-[0_0_50px_rgba(96,165,250,0.65)] hover:scale-110 transition-all duration-500 ease-out flex items-center justify-center z-40"
      aria-label="Create new note"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-7 w-7"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2.5}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
      </svg>
    </button>
  );
}

export default FloatingButton;
