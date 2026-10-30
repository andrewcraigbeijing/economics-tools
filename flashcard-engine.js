(function(root){
  const intervals={red:{turns:2,ms:30000},yellow:{turns:5,ms:300000},green:{turns:15,ms:86400000}};
  const priority={red:0,yellow:1,new:2,green:3};
  function dueTime(record){const rule=intervals[record?.rating];if(!rule)return 0;return Number(record.dueAt)||((Number(record.lastReviewed)||0)+rule.ms)}
  function isDue(record,turn,now){if(!intervals[record?.rating])return true;return (Number.isFinite(record.dueTurn)&&turn>=record.dueTurn)||now>=dueTime(record)}
  function chooseCard(cards,records,previousId,{turn=1,now=Date.now(),ahead=false}={}){
    if(!cards.length)return null;
    let candidates=cards.filter(c=>isDue(records[c.id],turn,now));
    if(!candidates.length){if(!ahead)return null;candidates=cards.slice().sort((a,b)=>(records[a.id]?.dueTurn??0)-(records[b.id]?.dueTurn??0)||dueTime(records[a.id])-dueTime(records[b.id]));}
    else candidates=candidates.slice().sort((a,b)=>{
      const ar=records[a.id],br=records[b.id];
      return (priority[ar?.rating]??priority.new)-(priority[br?.rating]??priority.new)||(Number(ar?.lastReviewed)||0)-(Number(br?.lastReviewed)||0);
    });
    // Prefer another due card to an immediate repeat, without reintroducing resting cards.
    return candidates.find(c=>c.id!==previousId)||candidates[0];
  }
  function updateRating(records,id,rating,now=Date.now(),turn=0){
    const rule=intervals[rating];if(!rule)throw new Error('Unknown card rating');
    return {...records,[id]:{rating,reviews:(Number(records[id]?.reviews)||0)+1,lastReviewed:now,dueTurn:turn+rule.turns,dueAt:now+rule.ms}};
  }
  root.EconFlashcards={intervals,dueTime,isDue,chooseCard,updateRating};
})(globalThis);
