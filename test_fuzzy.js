const FuzzyEngine = require('./fuzzyEngine.js');

// Test Case 1: Ideal student (Low Assignments, High Sleep, Stable Wallet, Chilling Stress)
console.log("--- TEST CASE 1: Ideal Student ---");
const test1 = FuzzyEngine.evaluate({
    assignmentLoad: 10,   // Light
    sleepHours: 10,       // WellRested
    walletBalance: 90,     // Stable
    stressLevel: 15       // Chilling
});
console.log(`Centroid Score: ${test1.score.toFixed(2)}`);
console.log(`Linguistic Status: ${test1.status}`);
console.log(`Burnout Risk: ${test1.burnoutRisk}`);
console.log(`Active Rules Count: ${test1.activeRules.length}`);
console.log(`First Active Rule: ${test1.activeRules[0]?.text || "None"}\n`);

// Test Case 2: Stressed Out Student (High Assignments, Zombie Sleep, Broke Wallet, Screaming Stress)
console.log("--- TEST CASE 2: Stressed Out Student ---");
const test2 = FuzzyEngine.evaluate({
    assignmentLoad: 90,   // Overloaded
    sleepHours: 2.5,      // Zombie
    walletBalance: 10,     // Broke
    stressLevel: 90       // Screaming
});
console.log(`Centroid Score: ${test2.score.toFixed(2)}`);
console.log(`Linguistic Status: ${test2.status}`);
console.log(`Burnout Risk: ${test2.burnoutRisk}`);
console.log(`Active Rules Count: ${test2.activeRules.length}`);
console.log(`First Active Rule: ${test2.activeRules[0]?.text || "None"}\n`);

// Test Case 3: Balanced/Average Student
console.log("--- TEST CASE 3: Balanced/Average Student ---");
const test3 = FuzzyEngine.evaluate({
    assignmentLoad: 50,   // Packed
    sleepHours: 6.5,      // Functioning
    walletBalance: 50,     // Surviving
    stressLevel: 55       // Concerned
});
console.log(`Centroid Score: ${test3.score.toFixed(2)}`);
console.log(`Linguistic Status: ${test3.status}`);
console.log(`Burnout Risk: ${test3.burnoutRisk}`);
console.log(`Active Rules Count: ${test3.activeRules.length}`);
console.log(`First Active Rule: ${test3.activeRules[0]?.text || "None"}\n`);

// Test Case 4: User boundary test (wallet = 100, stress = 95)
console.log("--- TEST CASE 4: User boundary test ---");
const test4 = FuzzyEngine.evaluate({
    assignmentLoad: 42,
    sleepHours: 11.2,
    walletBalance: 100,
    stressLevel: 95
});
console.log(`Centroid Score: ${test4.score.toFixed(2)}`);
console.log(`Linguistic Status: ${test4.status}`);
console.log(`Burnout Risk: ${test4.burnoutRisk}`);
console.log(`Active Rules Count: ${test4.activeRules.length}`);
console.log(`First Active Rule: ${test4.activeRules[0]?.text || "None"}\n`);
