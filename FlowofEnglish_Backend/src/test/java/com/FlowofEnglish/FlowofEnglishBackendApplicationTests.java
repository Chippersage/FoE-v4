package com.FlowofEnglish;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import static org.junit.jupiter.api.Assertions.*;
import java.time.LocalDate;

@SpringBootTest
class FlowofEnglishBackendApplicationTests {

    // Mock method to simulate getProgramWithStagesAndUnits behavior
    private boolean isStageUnlocked(boolean delayedStageUnlock, LocalDate stageStartDate, int delayInDays, LocalDate today) {
        if (!delayedStageUnlock) {
            return true; // Default behavior: stage is unlocked
        }
        LocalDate unlockDate = stageStartDate.plusDays(delayInDays);
        return !today.isBefore(unlockDate);
    }

    @Test
    void testWithoutDelayedStageUnlock() {
        // Scenario: Delayed_Stage_Unlock is disabled
        boolean delayedStageUnlock = false;
        LocalDate stageStartDate = LocalDate.of(2025, 1, 10);
        int delayInDays = 5;
        LocalDate today = LocalDate.of(2025, 1, 12);

        boolean result = isStageUnlocked(delayedStageUnlock, stageStartDate, delayInDays, today);
        assertTrue(result, "Stage should be unlocked when Delayed_Stage_Unlock is disabled");
    }

    @Test
    void testWithDelayedStageUnlock_UnlockNotReached() {
        // Scenario: Delayed_Stage_Unlock is enabled, and delay period is not reached
        boolean delayedStageUnlock = true;
        LocalDate stageStartDate = LocalDate.of(2025, 1, 10);
        int delayInDays = 5;
        LocalDate today = LocalDate.of(2025, 1, 12);

        boolean result = isStageUnlocked(delayedStageUnlock, stageStartDate, delayInDays, today);
        assertFalse(result, "Stage should not be unlocked before the delay period");
    }

    @Test
    void testWithDelayedStageUnlock_UnlockReached() {
        // Scenario: Delayed_Stage_Unlock is enabled, and delay period is reached
        boolean delayedStageUnlock = true;
        LocalDate stageStartDate = LocalDate.of(2025, 1, 10);
        int delayInDays = 5;
        LocalDate today = LocalDate.of(2025, 1, 15);

        boolean result = isStageUnlocked(delayedStageUnlock, stageStartDate, delayInDays, today);
        assertTrue(result, "Stage should be unlocked when the delay period is reached");
    }

    @Test
    void testWithDelayedStageUnlock_ZeroDelayDays() {
        // Scenario: Delayed_Stage_Unlock is enabled, but delay is set to 0 days
        boolean delayedStageUnlock = true;
        LocalDate stageStartDate = LocalDate.of(2025, 1, 10);
        int delayInDays = 0;
        LocalDate today = LocalDate.of(2025, 1, 10);

        boolean result = isStageUnlocked(delayedStageUnlock, stageStartDate, delayInDays, today);
        assertTrue(result, "Stage should be unlocked immediately when delay is 0 days");
    }

    @Test
    void testWithInvalidData() {
        // Scenario: Missing or invalid data
        boolean delayedStageUnlock = true;
        LocalDate stageStartDate = null; // Invalid start date
        int delayInDays = 5;
        LocalDate today = LocalDate.of(2025, 1, 15);

        try {
            isStageUnlocked(delayedStageUnlock, stageStartDate, delayInDays, today);
            fail("Should throw NullPointerException for missing start date");
        } catch (NullPointerException e) {
            assertTrue(true, "Handled missing start date correctly");
        }
    }

    @Test
    void testWithSimultaneousUsers() {
        // Scenario: Two users with simultaneous start but different completion
        boolean delayedStageUnlock = true;
        LocalDate stageStartDate = LocalDate.of(2025, 1, 10);
        int delayInDays = 5;

        LocalDate userADate = LocalDate.of(2025, 1, 12); // Completion not enough for unlock
        LocalDate userBDate = LocalDate.of(2025, 1, 16); // Completion enough for unlock

        boolean resultA = isStageUnlocked(delayedStageUnlock, stageStartDate, delayInDays, userADate);
        boolean resultB = isStageUnlocked(delayedStageUnlock, stageStartDate, delayInDays, userBDate);

        assertFalse(resultA, "User A should not unlock the stage before the delay");
        assertTrue(resultB, "User B should unlock the stage after the delay");
    }
}
