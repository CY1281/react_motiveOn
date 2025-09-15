import React, { useEffect, useState } from 'react'
import { getnoticemain } from './api';
import styled from 'styled-components'

export const Container = styled.div`
  width: 100%;
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 10px;
`;
export const Card = styled.div`
  width: 100%;
  border: 1px solid dodgerblue;
  cursor: pointer;
  padding: 10px;
`;
export const Text = styled.div`
  color: #333;
  overflow-wrap: break-word;
  word-break: break-all;
`;

function Notice() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

// useEffect(() => {
//     getHomeworkList()
//       .then(res => setData(res.data))
//       .catch(err => console.error(err));
//   }, []);
  useEffect(() => {
    async function fetchData() {
      try {
        const res = await getnoticemain();
        setData(res.data);
        setLoading(false);
        console.log(res);

      } catch (err) {
        console.error(err);
        setData([]);
      } 
    }
    fetchData();
  }, []);

  return (
    <>
  <div>
      {JSON.stringify(data)}
    </div>

    </>
  );
}

export default Notice;