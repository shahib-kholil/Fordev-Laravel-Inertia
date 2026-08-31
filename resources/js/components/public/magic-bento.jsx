import { useState } from 'react';

export default function MagicBento({ cards }) {
    const orderedCards =
        cards.length === 4 ? [cards[3], ...cards.slice(0, 3)] : cards;
    const [activeIndex, setActiveIndex] = useState(0);

    return (
        <div className="flex flex-col gap-3 lg:h-[24rem] lg:flex-row">
            {orderedCards.map((card, index) => {
                const active = activeIndex === index;

                return (
                    <article
                        key={card.title}
                        onMouseEnter={() => setActiveIndex(index)}
                        onFocus={() => setActiveIndex(index)}
                        onClick={() => setActiveIndex(active ? null : index)}
                        onKeyDown={(event) => {
                            if (event.key === 'Enter' || event.key === ' ') {
                                event.preventDefault();
                                setActiveIndex(active ? null : index);
                            }
                        }}
                        role="button"
                        tabIndex={0}
                        className={`group relative flex min-h-36 cursor-pointer flex-col overflow-hidden rounded-3xl border p-5 transition-[flex,background-color,color,transform,box-shadow] duration-500 ease-out active:scale-[0.99] lg:min-w-0 lg:p-6 ${active ? 'bg-primary text-primary-foreground shadow-lg lg:flex-[2.2]' : 'bg-card text-card-foreground hover:bg-accent lg:flex-1'}`}
                    >
                        <div className="relative z-10 flex items-start justify-between gap-3">
                            <span
                                className={`max-w-full truncate rounded-full border px-2.5 py-1 text-xs font-medium transition-colors duration-300 ${active ? 'border-primary-foreground/30 bg-primary-foreground/10' : 'bg-muted text-muted-foreground'}`}
                            >
                                {card.label}
                            </span>
                        </div>

                        <div className="relative z-10 mt-auto pt-8">
                            <h3 className="text-xl font-semibold sm:text-2xl">
                                {card.title}
                            </h3>
                            <p
                                className={`mt-2 max-w-xl text-sm leading-6 transition-[opacity,max-height] duration-500 ${active ? 'max-h-24 opacity-80' : 'max-h-0 overflow-hidden opacity-0 lg:max-h-24 lg:opacity-70'}`}
                            >
                                {active
                                    ? card.details || card.description
                                    : card.description}
                            </p>
                        </div>

                        <div
                            aria-hidden="true"
                            className={`absolute -right-10 -bottom-10 size-32 rounded-full border transition-all duration-500 sm:size-40 ${active ? 'scale-100 border-primary-foreground/20 opacity-100' : 'scale-75 border-primary/15 opacity-0'}`}
                        />
                        <div
                            aria-hidden="true"
                            className={`absolute right-8 bottom-8 size-3 rounded-full transition-all duration-500 ${active ? 'translate-0 bg-primary-foreground/60 opacity-100' : 'translate-y-4 bg-primary opacity-0'}`}
                        />
                    </article>
                );
            })}
        </div>
    );
}
