---
title: "Mastering Binary Search & Monotonic Predicates"
date: "2024-10-15"
tags: [cp, algorithms, binary-search, c++]
event: "CPS Academy"
summary: "A practical guide to identifying monotonic search spaces, avoiding off-by-one errors, and solving tricky boundary search problems in competitive programming."
---

Binary search is often considered the most deceptively simple algorithm in competitive programming. While finding an integer in a sorted array is straightforward, formulating optimization problems as monotonic decision predicates is where its true power lies.

## The Core Principle: Monotonicity

Any search space where the condition transforms monotonically from `False` to `True` (or vice-versa) can be searched in logarithmic time $O(\log N)$.

```cpp
bool check(long long mid) {
    // Return true if condition is satisfied
    return calculate(mid) >= target;
}

long long low = 1, high = 1e18, ans = -1;
while (low <= high) {
    long long mid = low + (high - low) / 2;
    if (check(mid)) {
        ans = mid;
        high = mid - 1; // Minimize the valid answer
    } else {
        low = mid + 1;
    }
}
```

## Key Takeaways from CPS Academy Batch-3
1. **Always establish explicit bounds**: Avoid arbitrary constants; compute the theoretical minimum and maximum answers.
2. **Handle potential overflows**: Use `low + (high - low) / 2` and `long long` for upper ranges exceeding $2 \times 10^9$.
3. **Double check the transition**: Verify whether you need the first `True` or the last `False`.

Continuous practice on CodeChef and LeetCode reinforces this intuition until designing the `check()` predicate becomes second nature.

