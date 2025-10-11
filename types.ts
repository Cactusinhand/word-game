export interface BilingualString {
  en: string;
  zh: string;
}

export interface GameManual {
  targetWord: BilingualString;
  coreGame: {
    title: BilingualString;
    description: BilingualString;
  };
  gameBoards: {
    title: BilingualString;
    boardA: {
      name: BilingualString;
      usage: BilingualString;
    };
    boardB: {
      name: BilingualString;
      usage: BilingualString;
    };
  };
  originAndTeardown: {
    title: BilingualString;
    teardown: BilingualString;
    story: BilingualString;
  };
  foulWarning: {
    title: BilingualString;
    description: BilingualString;
  };
  masteryTip: {
    title: BilingualString;
    description: BilingualString;
  };
}
