const NewsTicker = () => {
  const newsItems = [
    "SEO automatisering staat nu live",
    "Monday planner agent is gaande"
  ];

  // Duplicate content for seamless loop
  const repeatedContent = Array(3).fill(newsItems).flat();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-muted/80 backdrop-blur-sm border-t border-border">
      <div className="overflow-hidden py-3">
        <div className="ticker-content flex items-center gap-6 whitespace-nowrap">
          {repeatedContent.map((item, index) => (
            <div key={index} className="flex items-center gap-3">
              <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                Live
              </span>
              <span className="live-dot w-2 h-2 bg-green-500 rounded-full" />
              <span className="text-sm text-muted-foreground">
                {item}
              </span>
              {index < repeatedContent.length - 1 && (
                <span className="text-muted-foreground/50">•</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NewsTicker;
