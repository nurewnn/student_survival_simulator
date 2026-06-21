/**
 * ISP568: Fuzzy Logic Systems
 * HOW COOKED ARE YOU? - Student Survival Simulator
 * Core Mamdani Fuzzy Inference Engine
 */

// 1. MEMBERSHIP FUNCTION DEFINITIONS
// Triangular fuzzy set: [a, b, c]
// Trapezoidal fuzzy set: [a, b, c, d]
const MF = {
    // 1. Assignment Load (Range: 0 - 100)
    assignmentLoad: {
        Light: [0, 0, 20, 45],
        Packed: [30, 50, 50, 70],
        Overloaded: [55, 80, 100, 100]
    },
    // 2. Sleep Hours (Range: 0 - 12 hours)
    sleepHours: {
        Zombie: [0, 0, 3, 5],
        Functioning: [4, 6, 7, 9],
        WellRested: [8, 10, 12, 12]
    },
    // 3. Wallet Balance (Range: 0 - 100)
    walletBalance: {
        Broke: [0, 0, 15, 35],
        Surviving: [25, 45, 55, 75],
        Stable: [65, 80, 100, 100]
    },
    // 4. Stress Level (Range: 0 - 100)
    stressLevel: {
        Chilling: [0, 0, 25, 45],
        Concerned: [35, 55, 65, 80],
        Screaming: [70, 85, 100, 100]
    },
    // Output: Student Survival Score (Range: 0 - 100)
    survivalScore: {
        AcademicVictim: [0, 0, 10, 25],
        DeepFried: [20, 35, 45, 55],
        Cooked: [45, 55, 65, 75],
        HangingInThere: [65, 75, 85, 90],
        Thriving: [85, 90, 100, 100]
    }
};

/**
 * Calculates the Degree of Membership (DOM) for a given value x
 * @param {number} x - The crisp input value
 * @param {number[]} p - Array of points defining the fuzzy set [a, b, c] or [a, b, c, d]
 * @returns {number} Degree of membership between 0 and 1
 */
function getDOM(x, p) {
    // Trapezoidal membership function [a, b, c, d]
    if (p.length === 4) {
        if (x >= p[1] && x <= p[2]) return 1;
        if (x <= p[0] || x >= p[3]) return 0;
        if (x > p[0] && x < p[1]) return (x - p[0]) / (p[1] - p[0]);
        if (x > p[2] && x < p[3]) return (p[3] - x) / (p[3] - p[2]);
    }
    // Triangular membership function [a, b, c]
    else if (p.length === 3) {
        if (x === p[1]) return 1;
        if (x <= p[0] || x >= p[2]) return 0;
        if (x > p[0] && x < p[1]) return (x - p[0]) / (p[1] - p[0]);
        if (x > p[1] && x < p[2]) return (p[2] - x) / (p[2] - p[1]);
    }
    return 0;
}

// 2. PROGRAMMATIC 81-RULE GENERATOR
// This mathematically defines the rule base rather than hardcoding 81 strings.
// Scoring system:
// Assignment Load: Light = +2, Packed = 0, Overloaded = -2
// Sleep Hours: Zombie = -2, Functioning = 0, WellRested = +2
// Wallet Balance: Broke = -1, Surviving = 0, Stable = +1
// Stress Level: Chilling = +2, Concerned = 0, Screaming = -2
const ruleOutputs = {
    assignmentLoad: { Light: 2, Packed: 0, Overloaded: -2 },
    sleepHours: { Zombie: -2, Functioning: 0, WellRested: 2 },
    walletBalance: { Broke: -1, Surviving: 0, Stable: 1 },
    stressLevel: { Chilling: 2, Concerned: 0, Screaming: -2 }
};

function getRuleOutputClass(score) {
    if (score >= 5) return 'Thriving';
    if (score >= 2) return 'HangingInThere';
    if (score >= -1) return 'Cooked';
    if (score >= -4) return 'DeepFried';
    return 'AcademicVictim';
}

// Pre-generate the 81 rules
const RULES = [];
const sets = {
    assignmentLoad: ['Light', 'Packed', 'Overloaded'],
    sleepHours: ['Zombie', 'Functioning', 'WellRested'],
    walletBalance: ['Broke', 'Surviving', 'Stable'],
    stressLevel: ['Chilling', 'Concerned', 'Screaming']
};

for (const a of sets.assignmentLoad) {
    for (const s of sets.sleepHours) {
        for (const w of sets.walletBalance) {
            for (const st of sets.stressLevel) {
                // Calculate weight score to assign output logically
                const score = ruleOutputs.assignmentLoad[a] +
                              ruleOutputs.sleepHours[s] +
                              ruleOutputs.walletBalance[w] +
                              ruleOutputs.stressLevel[st];
                const output = getRuleOutputClass(score);

                RULES.push({
                    inputs: { assignmentLoad: a, sleepHours: s, walletBalance: w, stressLevel: st },
                    output: output,
                    text: `IF Assignment Load is ${a} AND Sleep Hours is ${s} AND Wallet Balance is ${w} AND Stress Level is ${st} THEN Student Survival Score is ${output.replace(/([A-Z])/g, ' $1').trim()}`
                });
            }
        }
    }
}

// 3. FUZZY INFERENCE SYSTEM (FIS) EVALUATOR
const FuzzyEngine = {
    // Export membership coordinates for UI Graph drawing
    MF: MF,

    // Export rule base for report generation
    RULES: RULES,

    /**
     * Executes the Mamdani Fuzzy Inference process
     * @param {Object} inputs - Crisp values: { assignmentLoad, sleepHours, walletBalance, stressLevel }
     * @returns {Object} { score, status, activeRules, aggregatedOutput }
     */
    evaluate(inputs) {
        // Step 1: Fuzzification (Compute membership degrees)
        const dom = {
            assignmentLoad: {
                Light: getDOM(inputs.assignmentLoad, MF.assignmentLoad.Light),
                Packed: getDOM(inputs.assignmentLoad, MF.assignmentLoad.Packed),
                Overloaded: getDOM(inputs.assignmentLoad, MF.assignmentLoad.Overloaded)
            },
            sleepHours: {
                Zombie: getDOM(inputs.sleepHours, MF.sleepHours.Zombie),
                Functioning: getDOM(inputs.sleepHours, MF.sleepHours.Functioning),
                WellRested: getDOM(inputs.sleepHours, MF.sleepHours.WellRested)
            },
            walletBalance: {
                Broke: getDOM(inputs.walletBalance, MF.walletBalance.Broke),
                Surviving: getDOM(inputs.walletBalance, MF.walletBalance.Surviving),
                Stable: getDOM(inputs.walletBalance, MF.walletBalance.Stable)
            },
            stressLevel: {
                Chilling: getDOM(inputs.stressLevel, MF.stressLevel.Chilling),
                Concerned: getDOM(inputs.stressLevel, MF.stressLevel.Concerned),
                Screaming: getDOM(inputs.stressLevel, MF.stressLevel.Screaming)
            }
        };

        // Step 2 & 3: Rule Evaluation & Clipping (Mamdani Min)
        const activeRules = [];
        
        // Loop through all 81 rules to evaluate their firing strength
        for (const rule of RULES) {
            const muA = dom.assignmentLoad[rule.inputs.assignmentLoad];
            const muS = dom.sleepHours[rule.inputs.sleepHours];
            const muW = dom.walletBalance[rule.inputs.walletBalance];
            const muSt = dom.stressLevel[rule.inputs.stressLevel];

            // Firing strength (intersection of inputs is the minimum of their membership values)
            const strength = Math.min(muA, muS, muW, muSt);

            if (strength > 0) {
                activeRules.push({
                    text: rule.text,
                    inputs: rule.inputs,
                    output: rule.output,
                    strength: strength
                });
            }
        }

        // Step 4: Aggregation of Outputs (Mamdani Max)
        // Discretize output domain from 0 to 100 (101 points)
        const aggregatedOutput = new Array(101).fill(0);
        for (let z = 0; z <= 100; z++) {
            let maxVal = 0;
            for (const r of activeRules) {
                // Get membership value of index z in output set
                const outDOM = getDOM(z, MF.survivalScore[r.output]);
                // Clip output set by rule firing strength
                const clippedVal = Math.min(r.strength, outDOM);
                // Aggregate (union is maximum)
                maxVal = Math.max(maxVal, clippedVal);
            }
            aggregatedOutput[z] = maxVal;
        }

        // Step 5: Defuzzification (Centroid Method / Center of Gravity)
        let numerator = 0;
        let denominator = 0;
        for (let z = 0; z <= 100; z++) {
            numerator += z * aggregatedOutput[z];
            denominator += aggregatedOutput[z];
        }

        // Crisp output score (fallback to 50 if denominator is 0)
        const score = denominator === 0 ? 50 : (numerator / denominator);

        // Determine linguistic status
        let status = 'Cooked';
        if (score >= 85) status = 'Thriving';
        else if (score >= 65) status = 'Hanging In There';
        else if (score >= 45) status = 'Cooked';
        else if (score >= 21) status = 'Deep Fried';
        else status = 'Academic Victim';

        // Calculate Burnout Risk (estimated purely from Sleep and Stress for the extra panel)
        // If Sleep is Zombie and Stress is Screaming -> High Risk
        // If Sleep is Well-Rested and Stress is Chilling -> Low Risk
        const zombieDOM = dom.sleepHours.Zombie;
        const screamingDOM = dom.stressLevel.Screaming;
        const chillingDOM = dom.stressLevel.Chilling;
        const wellRestedDOM = dom.sleepHours.WellRested;

        const highBurnout = Math.min(zombieDOM, screamingDOM);
        const lowBurnout = Math.min(wellRestedDOM, chillingDOM);

        let burnoutRisk = 'Medium';
        if (highBurnout > lowBurnout && highBurnout > 0.3) {
            burnoutRisk = 'High';
        } else if (lowBurnout > highBurnout && lowBurnout > 0.4) {
            burnoutRisk = 'Low';
        }

        return {
            score: score,
            status: status,
            burnoutRisk: burnoutRisk,
            activeRules: activeRules,
            aggregatedOutput: aggregatedOutput,
            fuzzifiedInputs: dom
        };
    }
};

// Export to node or browser global scope
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FuzzyEngine;
} else {
    window.FuzzyEngine = FuzzyEngine;
}
