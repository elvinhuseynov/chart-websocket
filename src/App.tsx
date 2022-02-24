import { useState, useEffect } from "react";
import useWebSocket from "react-use-websocket";
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import { useThrottleFn, useReactive, useMemoizedFn } from "ahooks";
import dayjs from "dayjs";
import { Dropdown, Col, Row, Button } from "antd";
import "antd/dist/antd.css";

import {
  SOCKET_URL,
  API_KEY,
  subscribtionData,
  SubscriptionTypes,
} from "./data";

// interface Data {
//   time_exchange: string;
//   time_coinapi: string;
//   ask_price: number;
//   ask_size: number;
//   bid_size: number;
//   bid_price: number;
//   symbol_id: string;
//   sequence: number;
//   type: string;
// }

interface IState {
  subscribeAssetId: SubscriptionTypes;
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
    socketCredentials: {
      type: "hello",
      apikey: API_KEY,
      heartbeat: false,
      subscribe_data_type: ["trade"],
    },
  });

  const [socketUrl] = useState(SOCKET_URL);
  const [messageHistory, setMessageHistory] = useState([]);

  const { sendMessage, lastMessage } = useWebSocket(socketUrl);

  const { run } = useThrottleFn(
    (coinInfo) => {
      setMessageHistory((prev) => [
        ...(prev.length > 10 ? prev.slice(1) : prev),
        {
          name: dayjs(coinInfo.time_exchange).format("HH:mm"),
          value: coinInfo.price,
        },
      ]);
    },
    { wait: 100 }
  );

  useEffect(() => {
    if (lastMessage !== null) {
      run(JSON.parse(lastMessage.data));
    }
  }, [lastMessage, run]);

  useEffect(() => {
    sendMessage(
      JSON.stringify({
        ...state.socketCredentials,
        subscribe_filter_asset_id: [state.subscribeAssetId],
      })
    );
  }, [sendMessage, state.socketCredentials, state.subscribeAssetId]);

  // const handleClickSendMessage = useCallback(
  //   () =>
  //     sendMessage(
  //       JSON.stringify({
  //         ...state.socketCredentials,
  //         subscribe_filter_asset_id: [state.subscribeAssetId],
  //       })
  //     ),
  //   [sendMessage, state.socketCredentials, state.subscribeAssetId]
  // );

  const handleSubsription = useMemoizedFn((assetId: SubscriptionTypes) => {
    state.subscribeAssetId = assetId;
  });

  return (
    <Col>
      <Row>
        <Dropdown overlay={subscribtionData(handleSubsription)}>
          <Button>{state.subscribeAssetId}</Button>
        </Dropdown>
      </Row>
      {/* <button
        onClick={handleClickSendMessage}
        disabled={readyState !== ReadyState.OPEN}
      >
        Click Me to send 'Hello'
      </button>
      <button onClick={() => console.log(messageHistory, lastMessage)}>
        Click Me to send 'Hello'
      </button> */}

      <LineChart width={500} height={300} data={messageHistory}>
        <XAxis dataKey="name" />
        <YAxis dataKey="value" markerHeight={1_000_000} />
        <CartesianGrid strokeDasharray="5 5" />
        <Line type="monotone" dataKey="value" />
      </LineChart>
    </Col>
  );
};

export default App;
