(function(root){
  const weights={red:6,yellow:3,green:1};
  function cardWeight(record){return weights[record?.rating]||3}
  function chooseCard(cards,records,previousId,random=Math.random){
    if(!cards.length)return null;
    const candidates=cards.length>2?cards.filter(c=>c.id!==previousId):cards;
    const total=candidates.reduce((sum,c)=>sum+cardWeight(records[c.id]),0);
    let pick=Math.max(0,Math.min(0.999999999,random()))*total;
    for(const c of candidates){pick-=cardWeight(records[c.id]);if(pick<0)return c}
    return candidates[candidates.length-1];
  }
  function updateRating(records,id,rating,now=Date.now()){
    if(!Object.hasOwn(weights,rating))throw new Error('Unknown card rating');
    return {...records,[id]:{rating,reviews:(Number(records[id]?.reviews)||0)+1,lastReviewed:now}};
  }
  root.EconFlashcards={cardWeight,chooseCard,updateRating};
})(globalThis);
