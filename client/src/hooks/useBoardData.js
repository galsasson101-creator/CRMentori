import { useState, useEffect, useCallback, useMemo } from 'react';
import * as api from '../lib/api';

export default function useBoardData(apiPath, groupByKey) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(() => {
    setLoading(true);
    setError(null);
    api
      .get(apiPath)
      .then((result) => {
        const list = Array.isArray(result) ? result : result.data || [];
        setItems(list);
      })
      .catch((err) => {
        setError(err.message || 'Failed to load data');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [apiPath]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const groups = useMemo(() => {
    const grouped = {};
    items.forEach((item) => {
      const key = item[groupByKey] || 'unknown';
      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(item);
    });
    return grouped;
  }, [items, groupByKey]);

  const updateItem = useCallback(
    async (id, data) => {
      const updated = await api.patch(`${apiPath}/${id}`, data);
      setItems((prev) =>
        prev.map((item) => (item.id === id ? { ...item, ...updated } : item))
      );
      return updated;
    },
    [apiPath]
  );

  const deleteItem = useCallback(
    async (id) => {
      await api.del(`${apiPath}/${id}`);
      setItems((prev) => prev.filter((item) => item.id !== id));
    },
    [apiPath]
  );

  return { items, groups, loading, error, refetch: fetchData, updateItem, deleteItem };
}
