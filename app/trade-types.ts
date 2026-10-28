export interface Trade {
  id: number;
  battlenet_id: string;
  item_name_ko: string;
  price_rune: string;
  room_name: string;
  item_description: string | null;
  status: string | null;
  created_at: string;
  game_mode: string | null;
}

export interface TradeComment {
  id: number;
  trade_id: number;
  content: string;
  created_at: string;
}

export interface TradeFormValues {
  gameMode: 'ladder' | 'standard';
  battlenetId: string;
  itemBase: string;
  description: string;
  priceRune: string;
  roomInfo: string;
}
