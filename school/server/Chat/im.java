import java.util.*;

public class CloudSystem {

    public static long maximumCapacity(List<Integer> memory) {
        int n = memory.size();
        Collections.sort(memory);

        long maxSum = 0;

        // Try all combinations of n/2 elements as primary starting from index 0 to n/2
        // But to ensure coverage, we'll slide a window of size n/2 over the array
        for (int i = 0; i <= n - n / 2; i++) {
            List<Integer> primary = memory.subList(i, i + n / 2);
            List<Integer> backup = new ArrayList<>(memory);

            // Remove the elements used in 'primary' from the full list
            for (int j = i + n / 2 - 1; j >= i; j--) {
                backup.remove(j);
            }

            // Try to pair each primary with a backup >= it
            boolean valid = true;
            int backupPointer = 0;

            for (int p : primary) {
                while (backupPointer < backup.size() && backup.get(backupPointer) < p) {
                    backupPointer++;
                }
                if (backupPointer == backup.size()) {
                    valid = false;
                    break;
                }
                backupPointer++; // move to next backup
            }

            if (valid) {
                long sum = 0;
                for (int val : primary) {
                    sum += val;
                }
                maxSum = Math.max(maxSum, sum);
            }
        }

        return maxSum;
    }

    public static void main(String[] args) {
        List<Integer> memory = Arrays.asList(1, 2, 1, 2);
        System.out.println(maximumCapacity(memory)); // Should print 3
    }
}
