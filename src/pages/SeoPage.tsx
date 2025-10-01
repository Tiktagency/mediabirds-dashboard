const SeoPage = () => {
  return (
    <div className="fixed inset-0 w-screen h-screen">
      {/* Fullscreen iframe */}
      <iframe
        src="https://seo-interface.lovable.app/"
        className="w-full h-full border-0"
        title="Zoekwoord onderzoek"
        allow="clipboard-read; clipboard-write"
      />
    </div>
  );
};

export default SeoPage;