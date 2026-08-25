import type { EngagementAnalytics, EngagementRobot, Game } from "../types";

export const mockGames: readonly Game[] = [
  {id:"memory-match",name:"Memory Match",description:"A visual matching challenge that adapts to the guest's pace.",version:"1.4.2",status:"active",supportedRobots:["WB-001","RB-041"],lastUpdated:"2026-08-18",usage:2486,configuration:{difficulty:"medium",durationMinutes:8,soundEnabled:true,instructions:"Match each pair before time expires."}},
  {id:"quick-quiz",name:"Quick Quiz",description:"Customizable trivia rounds for groups and events.",version:"2.0.1",status:"active",supportedRobots:["WB-001","RB-019","RB-041"],lastUpdated:"2026-08-21",usage:1914,configuration:{difficulty:"medium",durationMinutes:10,soundEnabled:true,instructions:"Select the best answer after each prompt."}},
  {id:"robot-says",name:"Robot Says",description:"A movement and listening game inspired by Simon Says.",version:"1.1.0",status:"draft",supportedRobots:["RB-019","RB-041"],lastUpdated:"2026-08-14",usage:846,configuration:{difficulty:"easy",durationMinutes:6,soundEnabled:true,instructions:"Only move when the robot says Robot Says."}},
  {id:"treasure-hunt",name:"Treasure Hunt",description:"Guided clues lead guests through an interactive venue route.",version:"3.2.0",status:"active",supportedRobots:["WB-001"],lastUpdated:"2026-08-23",usage:1388,configuration:{difficulty:"hard",durationMinutes:15,soundEnabled:true,instructions:"Follow the clues and scan each checkpoint."}},
  {id:"hotel-explorer",name:"Hotel Explorer",description:"A family-friendly discovery tour of hotel amenities.",version:"1.0.8",status:"active",supportedRobots:["WB-001","RB-041"],lastUpdated:"2026-08-17",usage:1124,configuration:{difficulty:"easy",durationMinutes:12,soundEnabled:true,instructions:"Choose a destination and follow your guide."}},
  {id:"reaction-challenge",name:"Reaction Challenge",description:"Fast visual prompts test response speed and accuracy.",version:"0.9.2",status:"draft",supportedRobots:["RB-019"],lastUpdated:"2026-08-12",usage:734,configuration:{difficulty:"hard",durationMinutes:5,soundEnabled:false,instructions:"Tap the matching symbol as quickly as possible."}}
];

export const mockRobots: readonly EngagementRobot[] = [
  {id:"WB-001",name:"Concierge One",model:"WayBot X2",location:"Main lobby",status:"online",volume:72,screenBrightness:84,language:"English"},
  {id:"RB-041",name:"Guest Services",model:"Relay R4",location:"Level 4",status:"online",volume:65,screenBrightness:76,language:"English"},
  {id:"RB-019",name:"Event Host",model:"Relay R4",location:"Conference wing",status:"busy",volume:80,screenBrightness:90,language:"French"},
  {id:"WB-014",name:"Pool Guide",model:"WayBot X1",location:"Recreation level",status:"offline",volume:60,screenBrightness:70,language:"English"}
];

export const mockAnalytics: EngagementAnalytics = {
  totals:{gamePlays:8492,dailyActiveUsers:384,sessionDuration:6.7,completionRate:78},
  daily:[{day:"Mon",plays:1060,users:312,duration:6.1,completion:74},{day:"Tue",plays:1180,users:340,duration:6.4,completion:76},{day:"Wed",plays:1240,users:358,duration:6.8,completion:79},{day:"Thu",plays:1174,users:344,duration:6.5,completion:77},{day:"Fri",plays:1420,users:384,duration:7.1,completion:81},{day:"Sat",plays:1328,users:372,duration:7.3,completion:82},{day:"Sun",plays:1090,users:326,duration:6.7,completion:78}],
  popularGames:mockGames.map(game=>({name:game.name,plays:game.usage})).sort((a,b)=>b.plays-a.plays),
  byRobot:[{robot:"WB-001",sessions:3280},{robot:"RB-041",sessions:2460},{robot:"RB-019",sessions:1732},{robot:"WB-014",sessions:1020}]
};
