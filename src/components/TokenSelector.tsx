import { useState } from 'react';
import { TOKENS, type Token, type TokenInfo } from '../types';
import { ChevronDown, Search } from 'lucide-react';
import { clsx } from 'clsx';

interface TokenSelectorProps {
  value: Token;
  onChange: (token: Token) => void;
  disabled?: boolean;
}

export function TokenSelector({ value, onChange, disabled = false }: TokenSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');

  const selectedToken = TOKENS.find(t => t.symbol === value);

  const filteredTokens = TOKENS.filter(t => 
    t.symbol.toLowerCase().includes(search.toLowerCase()) ||
    t.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={clsx(
          "flex items-center gap-3 w-full px-4 py-3 rounded-xl",
          "bg-white border border-gray-200",
          "hover:border-gray-300 transition-colors",
          "disabled:opacity-50 disabled:cursor-not-allowed"
        )}
      >
        <span className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-100 to-indigo-100 flex items-center justify-center text-lg">
          {selectedToken?.logo}
        </span>
        <span className="font-medium text-gray-900">{value}</span>
        <ChevronDown className={clsx("ml-auto w-4 h-4 text-gray-400 transition-transform", isOpen && "rotate-180")} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden z-50">
          <div className="p-3 border-b border-gray-100">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search tokens..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-violet-500"
              />
            </div>
          </div>
          <div className="max-h-60 overflow-y-auto p-2">
            {filteredTokens.map((token) => (
              <button
                key={token.symbol}
                type="button"
                onClick={() => {
                  onChange(token.symbol);
                  setIsOpen(false);
                  setSearch('');
                }}
                className={clsx(
                  "flex items-center gap-3 w-full px-3 py-2 rounded-lg",
                  "hover:bg-gray-50 transition-colors",
                  value === token.symbol && "bg-violet-50"
                )}
              >
                <span className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-100 to-indigo-100 flex items-center justify-center text-lg">
                  {token.logo}
                </span>
                <div className="text-left">
                  <p className="font-medium text-gray-900">{token.symbol}</p>
                  <p className="text-xs text-gray-500">{token.name}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export { TOKENS };
