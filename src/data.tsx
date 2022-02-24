import { Menu } from "antd";

export type SubscriptionTypes = "BTC" | "ETH";

export const API_KEY = "CCA9A3A9-698B-4445-AF4F-EB12233B86FA";
export const SOCKET_URL = "ws://ws.coinapi.io/v1/";

export const subscribtionData = (
  handleSubsription: (assetId: SubscriptionTypes) => void
) => (
  <Menu onClick={({ key }) => handleSubsription(key as SubscriptionTypes)}>
    <Menu.Item key="ETH">ETH</Menu.Item>
    <Menu.Item key="BTC">BTC</Menu.Item>
  </Menu>
);
