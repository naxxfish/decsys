const outcomes = {
 "PASSED": {
   headline: "Proposal has passed",
   style: "success",
   extraText: "This proposal has been _accepped_ according to the acceptance criteria set out in the rules"
 },
 "NEEDS_REVISION": {
   headline: "Proposal requires revision",
   style: "warning",
   extraText: "This proposal has not been _accepted_, but may be revised and re-submitted"
 },
 "BLOCKED": {
   headline: "Proposal has been blocked",
   style: "danger",
   extraText: "This proposal has been **permenantly** blocked!"
 }
}

module.exports = outcomes
