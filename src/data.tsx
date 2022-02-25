import { Menu } from "antd";
import { Dayjs } from "dayjs";

export type SubscriptionTypes = "BTC" | "ETH";

export enum SYMBOL_IDS {
  BINANCE_SPOT_BTC_USDT = "BINANCE_SPOT_BTC_USDT",
  BINANCE_SPOT_ETH_USDT = "BINANCE_SPOT_ETH_USDT",
}
export const API_KEY = "CCA9A3A9-698B-4445-AF4F-EB12233B86FA";
export const SOCKET_URL = "ws://ws.coinapi.io/v1/";

export interface ICoinData {
  time_exchange: string;
  time_coinapi: string;
  uuid: string;
  price: number;
  size: number;
  taker_side: string;
  symbol_id: SYMBOL_IDS;
  sequence: number;
  type: string;
}

export interface IMessageHistory {
  time: Dayjs;
  price: number;
}

export const subscribtionData = (
  handleSubsription: (assetId: SubscriptionTypes) => void
) => (
  <Menu onClick={({ key }) => handleSubsription(key as SubscriptionTypes)}>
    <Menu.Item key="ETH">ETH</Menu.Item>
    <Menu.Item key="BTC">BTC</Menu.Item>
  </Menu>
);
