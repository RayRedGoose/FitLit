class Activity {
  constructor(userRepo) {
    this.userID = userRepo.currentUserId;
    this.date = userRepo.day;
    this.numSteps = null;
    this.minutesActive = null;
    this.flightsOfStairs = null;
    this.goalComplete = false;
  }

  changeDate(userRepo, date) {
    if (!date) {
      this.date = userRepo.day;
      this.updateInfo(userRepo);
    } else if (date === 'All time') {
      this.time = '';
      this.getAverageForSevenDays(userRepo);
    } else {
      this.date = date;
      this.updateInfo(userRepo);
    }
  }

  updateInfo(userRepo) {
    const dayData = userRepo.activityUsersData.find(data => data.userID === this.userID && data.date === this.date);
    if (dayData) {
      this.numSteps = dayData.numSteps;
      this.minutesActive = dayData.minutesActive;
      this.flightsOfStairs= dayData.flightsOfStairs;
    } else {
      this.numSteps = 0;
      this.minutesActive = 0;
      this.flightsOfStairs= 0;
    }
  }

  findMiles(user) {
    const miles = this.numSteps * user.strideLength / 5280;
    return parseInt(miles);
  }

  getWeekInformation(userRepo) {
    const week = userRepo.getWeekDates(userRepo.day);
    const weekInfo = userRepo.activityUsersData.filter(data => data.userID === this.userID && week.includes(data.date));
    return weekInfo;
  }

  getWeekTotal(userRepo, id) {
    let currentPersonsActivity = userRepo.filter(data => data.userID === id);
    let weekTotal = currentPersonsActivity.slice(((currentPersonsActivity.length - 1) - 6), ((currentPersonsActivity.length - 1) + 1));
    let total = weekTotal.reduce((acc, day) => {
      acc += day.numSteps
      return acc;
    }, 0)
    return total;
  }

  findStepWinner(youAmount, playerOneName, playerOneAmount, playerTwoName, playerTwoAmount) {
    if (youAmount >  playerOneAmount && youAmount > playerTwoAmount) {
      return 'You have the most steps!'
    } else if (playerOneAmount > youAmount && playerOneAmount > playerTwoAmount) {
      return `${playerOneName} has the most steps!`
    } else if (playerTwoAmount > playerOneAmount && playerTwoAmount > youAmount) {
      return `${playerTwoName} has the most steps!`
    }
  }

  getAverageForSevenDays(userRepo) {
    const average = this.getWeekInformation(userRepo).reduce((avr, data) => {
      avr.numSteps += data.numSteps / 7;
      avr.minutesActive += data.minutesActive / 7;
      avr.flightsOfStairs += data.flightsOfStairs / 7;
      return avr;
    }, {numSteps: 0, minutesActive: 0, flightsOfStairs:0});
    this.numSteps = parseInt(average.numSteps);
    this.minutesActive = parseInt(average.minutesActive);
    this.flightsOfStairs = parseInt(average.flightsOfStairs);
  }

  checkStepGoal(user) {
    if (this.numSteps >= user.dailyStepGoal) {
      this.goalComplete = true;
    }
    return this.goalComplete;
  }

  findGoalCompletedDays(userRepo, user) {
    const week = userRepo.getWeekDates(userRepo.day);
    return userRepo.activityUsersData.filter(data => data.numSteps >= user.dailyStepGoal && week.includes(data.date)).map(data => data.date);
  }

  findStairRecord(activeData) {
    const stairRecord = activeData.filter(data => data.userID === this.userID).reduce((highest, data) => {
      if (data.flightsOfStairs > highest) {
        highest = data.flightsOfStairs;
      }
      return highest;
    }, 0);
    return stairRecord;
  }

  findDaysWithIncreasingSteps(userRepo) {
    const dataset = userRepo.activityUsersData.filter(data => data.userID === this.userID);
    let counter = 0;
    const days = dataset.reduce((days, data) => {
      if (!days[counter]) {
        days[counter] = [data];
      } else if (data.numSteps > days[counter][days[counter].length - 1].numSteps) {
        days[counter].push(data);
      } else {
        counter ++;
        days[counter] =[data];
      }
      return days;
    }, []).filter(days => days.length > 3);
    return days;
  }

  findStreaks(userRepo) {
    const dayGroups = this.findDaysWithIncreasingSteps(userRepo);
    const streaks = dayGroups.reduce((rows, group) => {
      const length = group.length
      const row = {period: `${group[0].date} - ${group[length - 1].date}`, streak: length };
      rows.push(row);
      return rows.sort((a,b) => (a.streak > b.streak) ? 1 : -1);
    }, [ ]);
    return streaks;
  }

  findHighestStreak(userRepo) {
    const streaks = this.findStreaks(userRepo);
    return streaks[streaks.length - 1].streak;
  }

  findHighestValue(userRepo, user, info) {
    const dataset = userRepo.activityUsersData.filter(data => data.userID === this.userID);
    const highests = dataset.reduce((list, data) => {
      if (data.numSteps > list.numSteps) {
        list.numSteps = data.numSteps;
        list.miles = parseInt(list.numSteps * user.strideLength / 5280);
      }
      if (data.minutesActive > list.minutesActive) {
        list.minutesActive = data.minutesActive;
      }
      if (data.flightsOfStairs > list.flightsOfStairs) {
        list.flightsOfStairs = data.flightsOfStairs;
      }
      return list;
    }, {numSteps: 0, miles: 0, minutesActive: 0, flightsOfStairs: 0});
    return highests[info]
  }
}

if (typeof module !== 'undefined') {
  module.exports = Activity;
}
