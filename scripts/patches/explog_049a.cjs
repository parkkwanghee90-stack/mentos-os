// 049a: move equation labels ①/② OUT of the $$\text{}$$ blocks (consistent with other fixes),
// so it renders cleanly whether or not the option-splitter runs. Image: 진수 -x^2+4x+5>0.
module.exports = [
  { keys: ["지수로그4단계/049a.webp", "explog_step4/049a.webp", "explog_step4/049a.png"],
    replaces: [
      ["\\quad \\cdots \\; \\text{①}$$", "\\quad \\cdots$$ ①"],
      ["\\quad \\cdots \\; \\text{②}$$", "\\quad \\cdots$$ ②"],
    ] },
];
