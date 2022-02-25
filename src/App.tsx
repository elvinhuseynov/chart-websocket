import { useState, useEffect } from "react";
import useWebSocket from "react-use-websocket";
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import { useReactive, useMemoizedFn } from "ahooks";
import dayjs from "dayjs";
import { Dropdown, Row, Button, Layout, Menu, Col, Card } from "antd";
import { Content, Header } from "antd/lib/layout/layout";
import {
  SOCKET_URL,
  API_KEY,
  subscribtionData,
  SYMBOL_IDS,
  SubscriptionTypes,
  ICoinData,
  IMessageHistory,
} from "./data";
import currency from "currency.js";

interface IState {
  subscribeAssetId: SubscriptionTypes;
  symbolId: SYMBOL_IDS;
  latestPrice: string;
  latestExchangeTime: string;
  socketCredentials: {
    type: string;
    apikey: string;
    heartbeat: boolean;
    subscribe_data_type: string[];
  };
}

const App = () => {
  const state = useReactive<IState>({
    subscribeAssetId: "ETH",
    symbolId: SYMBOL_IDS.BINANCE_SPOT_ETH_USDT,
    latestPrice: currency(0).format(),
    latestExchangeTime: dayjs().format("MMM d, HH:mm"),
    socketCredentials: {
      type: "hello",
      apikey: API_KEY,
      heartbeat: false,
      subscribe_data_type: ["trade"],
    },
  });

  const [socketUrl] = useState(SOCKET_URL);
  const [messageHistory, setMessageHistory] = useState<Array<IMessageHistory>>(
    []
  );

  const { sendMessage, lastMessage } = useWebSocket(socketUrl);

  const retrieveCoinData = useMemoizedFn((coinInfo: ICoinData) => {
    if (coinInfo?.symbol_id === state.symbolId)
      setMessageHistory((prev) => [
        ...(prev.length > 9 ? prev.slice(1) : prev),
        {
          time: dayjs(coinInfo.time_exchange),
          price: coinInfo.price,
        },
      ]);

    state.latestPrice = currency(messageHistory.at(-1)?.price).format();
    state.latestExchangeTime = dayjs(messageHistory.at(-1)?.time).format(
      "MMM d, HH:mm"
    );
  });

  useEffect(() => {
    if (lastMessage !== null) {
      retrieveCoinData(JSON.parse(lastMessage.data));
    }
  }, [lastMessage, retrieveCoinData]);

  useEffect(() => {
    sendMessage(
      JSON.stringify({
        ...state.socketCredentials,
        subscribe_filter_asset_id: [state.subscribeAssetId],
      })
    );
  }, [sendMessage, state.socketCredentials, state.subscribeAssetId]);

  const handleSubsription = useMemoizedFn((assetId: SubscriptionTypes) => {
    setMessageHistory([]);
    state.subscribeAssetId = assetId;
    state.symbolId =
      assetId === "ETH"
        ? SYMBOL_IDS.BINANCE_SPOT_ETH_USDT
        : SYMBOL_IDS.BINANCE_SPOT_BTC_USDT;
  });

  return (
    <Layout className="layout">
      <Header>
        <Menu theme="dark" mode="horizontal" defaultSelectedKeys={["2"]}>
          Crypto Chart
          <Row
            style={{
              marginLeft: "2rem",
              marginTop: "1rem",
            }}
          >
            <Dropdown overlay={subscribtionData(handleSubsription)}>
              <Button>{state.subscribeAssetId}</Button>
            </Dropdown>
          </Row>
        </Menu>
      </Header>
      <Content style={{ padding: "2rem 50px" }}>
        <Row>
          <Col span={12}>
            <LineChart width={500} height={500} data={messageHistory}>
              <XAxis />
              <YAxis dataKey="price" interval="preserveStartEnd" />
              <CartesianGrid strokeDasharray="5 5" />
              <Line type="monotone" dataKey="price" />
            </LineChart>
          </Col>
          <Col span={12}>
            <Card title="Market Data" style={{ width: 500, height: 480 }}>
              <Row>Symbol: {state.subscribeAssetId}</Row>
              <Row>Market Price: {state.latestPrice}</Row>
              <Row>Exchange Time: {state.latestExchangeTime} </Row>
            </Card>
          </Col>
        </Row>
      </Content>
    </Layout>
  );
};

export default App;
