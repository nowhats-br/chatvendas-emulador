import React from 'react';
import { ShoppingCart } from 'lucide-react';

interface CarouselCard {
    name: string;
    price: string;
    stock?: string;
    imageUrl?: string;
    colors?: string[];
    sizes?: string[];
}

interface CarouselData {
    type: 'carousel';
    productName: string;
    cards: CarouselCard[];
}

interface CarouselPreviewProps {
    data: CarouselData;
}

export function CarouselPreview({ data }: CarouselPreviewProps) {
    return (
        <div className="bg-white rounded-lg border border-gray-200 p-3 max-w-md">
            {/* Header */}
            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-200">
                <ShoppingCart size={16} className="text-blue-600" />
                <span className="text-sm font-semibold text-gray-800">
                    Carrossel: {data.productName}
                </span>
            </div>

            {/* Cards Scroll */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                {data.cards.map((card, index) => (
                    <div
                        key={index}
                        className="flex-shrink-0 w-40 bg-gray-50 rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
                    >
                        {/* Image */}
                        {card.imageUrl ? (
                            <img
                                src={card.imageUrl}
                                alt={card.name}
                                className="w-full h-24 object-cover"
                            />
                        ) : (
                            <div className="w-full h-24 bg-gray-200 flex items-center justify-center">
                                <ShoppingCart size={24} className="text-gray-400" />
                            </div>
                        )}

                        {/* Content */}
                        <div className="p-2">
                            <h4 className="text-xs font-semibold text-gray-900 truncate" title={card.name}>
                                {card.name}
                            </h4>
                            
                            {/* Preço e Estoque com espaço */}
                            <div className="flex items-center justify-between mt-1 gap-2">
                                <p className="text-sm font-bold text-green-600">
                                    R$ {parseFloat(card.price).toFixed(2)}
                                </p>
                                {card.stock && (
                                    <p className="text-[10px] text-gray-500 bg-gray-100 px-1 rounded">
                                        Est: {card.stock}
                                    </p>
                                )}
                            </div>

                            {/* Variations */}
                            {card.colors && card.colors.length > 0 && (
                                <div className="flex items-center gap-1 mt-1.5">
                                    <div className="flex flex-wrap gap-[2px]">
                                        {card.colors.slice(0, 6).map((color, idx) => {
                                            const colorHex = color === 'Branco' ? '#FFFFFF' : 
                                                            color === 'Preto' ? '#000000' :
                                                            color === 'Azul' ? '#3B82F6' :
                                                            color === 'Vermelho' ? '#EF4444' :
                                                            color === 'Verde' ? '#10B981' :
                                                            color === 'Amarelo' ? '#F59E0B' :
                                                            color === 'Rosa' ? '#EC4899' :
                                                            color === 'Roxo' ? '#8B5CF6' :
                                                            color === 'Laranja' ? '#F97316' :
                                                            color === 'Marrom' ? '#A16207' :
                                                            color === 'Cinza' ? '#6B7280' :
                                                            color === 'Bege' ? '#D2B48C' :
                                                            color === 'Navy' ? '#1E3A8A' :
                                                            color === 'Vinho' ? '#7F1D1D' :
                                                            color === 'Dourado' ? '#F59E0B' :
                                                            color === 'Prata' ? '#9CA3AF' : '#9CA3AF';
                                            
                                            return (
                                                <div
                                                    key={idx}
                                                    className="w-[6px] h-[6px] rounded-full border border-gray-300"
                                                    style={{ backgroundColor: colorHex }}
                                                    title={color}
                                                />
                                            );
                                        })}
                                        {card.colors.length > 6 && (
                                            <span className="text-[7px] text-gray-500 ml-0.5">+{card.colors.length - 6}</span>
                                        )}
                                    </div>
                                </div>
                            )}
                            {card.sizes && card.sizes.length > 0 && (
                                <p className="text-[9px] text-gray-500 truncate mt-0.5">
                                    {card.sizes.slice(0, 3).join(', ')}{card.sizes.length > 3 ? ` +${card.sizes.length - 3}` : ''}
                                </p>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Footer */}
            <div className="mt-2 pt-2 border-t border-gray-200">
                <p className="text-[10px] text-gray-500 text-center">
                    {data.cards.length} produto{data.cards.length > 1 ? 's' : ''} no carrossel
                </p>
            </div>
        </div>
    );
}