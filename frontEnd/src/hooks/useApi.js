import { useState, useEffect, useCallback } from "react";

/**
 * Generic data-fetching hook.
 *
 * Usage:
 *   const { data, loading, error, refetch } = useApi(fetchFn, [deps]);
 *
 * @param {Function} fetchFn  — async function that returns the data
 * @param {Array}    deps     — dependency array (re-fetches when these change)
 */
const useApi = (fetchFn, deps = []) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const execute = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const result = await fetchFn();
            setData(result);
        } catch (err) {
            setError(err?.response?.data?.message ?? err?.message ?? "Something went wrong");
        } finally {
            setLoading(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, deps);

    useEffect(() => {
        execute();
    }, [execute]);

    return { data, loading, error, refetch: execute };
};

export default useApi;
