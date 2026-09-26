(function() {
  var game;
  var ui;

  var DateOptions = {hour: 'numeric',
                 minute: 'numeric',
                 second: 'numeric',
                 year: 'numeric',
                 month: 'short',
                 day: 'numeric' };

  var main = function(dendryUI) {
    ui = dendryUI;
    game = ui.game;

    // MAX HAND SIZE PART STARTS -------------
    var originalDrawCard = dendryUI.dendryEngine.drawCard.bind(dendryUI.dendryEngine);
    dendryUI.dendryEngine.drawCard = function(deckId) {
        var engine = dendryUI.dendryEngine;
        var currentSceneId = engine.state.sceneId;
        var scene = engine.getCurrentScene();
        var currentHand = engine.state.currentHands[currentSceneId] || [];
        var maxCards = scene.maxCards;

        if (maxCards !== undefined && currentHand.length >= maxCards) {
            currentHand.splice(0, 1);
        }

        return originalDrawCard(deckId);
    };
    // MAX HAND SIZE PART ENDED HERE.

    // DISCARD PART STARTS -------------
    dendryUI.dendryEngine.discardCard = function(cardId) {
        var engine = dendryUI.dendryEngine;
        var currentSceneId = engine.state.sceneId;
        var currentHand = engine.state.currentHands[currentSceneId];
        if (!currentHand) return false;
        var idx = currentHand.findIndex(function(c) { return c.id === cardId; });
        if (idx === -1) return false;
        currentHand.splice(idx, 1);
        var scene = engine.getCurrentScene();
        dendryUI.displayHand(currentHand, scene.maxCards);
        return true;
    };
    // DISCARD PART ENDED HERE.
};
  
  var TITLE = "Social Democracy: An Alternate History" + '_' + "Autumn Chen";

  // the url is a link to game.json
  // test url: https://aucchen.github.io/social_democracy_mods/v0.1.json
  // TODO; 
  window.loadMod = function(url) {
      ui.loadGame(url);
  };

  window.showStats = function() {
    if (window.dendryUI.dendryEngine.state.sceneId.startsWith('library')) {
        window.dendryUI.dendryEngine.goToScene('backSpecialScene');
    } else {
        window.dendryUI.dendryEngine.goToScene('library');
    }
  };

  window.showMods = function() {
    window.hideOptions();
    if (window.dendryUI.dendryEngine.state.sceneId.startsWith('mod_loader')) {
        window.dendryUI.dendryEngine.goToScene('backSpecialScene');
    } else {
        window.dendryUI.dendryEngine.goToScene('mod_loader');
    }
  };
  
  window.showOptions = function() {
      var save_element = document.getElementById('options');
      window.populateOptions();
      save_element.style.display = "block";
      if (!save_element.onclick) {
          save_element.onclick = function(evt) {
              var target = evt.target;
              var save_element = document.getElementById('options');
              if (target == save_element) {
                  window.hideOptions();
              }
          };
      }
  };

  window.hideOptions = function() {
      var save_element = document.getElementById('options');
      save_element.style.display = "none";
  };

  window.disableBg = function() {
      window.dendryUI.disable_bg = true;
      document.body.style.backgroundImage = 'none';
      window.dendryUI.saveSettings();
  };

  window.enableBg = function() {
      window.dendryUI.disable_bg = false;
      window.dendryUI.setBg(window.dendryUI.dendryEngine.state.bg);
      window.dendryUI.saveSettings();
  };

  window.disableAnimate = function() {
      window.dendryUI.animate = false;
      window.dendryUI.saveSettings();
  };

  window.enableAnimate = function() {
      window.dendryUI.animate = true;
      window.dendryUI.saveSettings();
  };

  window.disableAnimateBg = function() {
      window.dendryUI.animate_bg = false;
      window.dendryUI.saveSettings();
  };

  window.enableAnimateBg = function() {
      window.dendryUI.animate_bg = true;
      window.dendryUI.saveSettings();
  };

  window.disableAudio = function() {
      window.dendryUI.toggle_audio(false);
      window.dendryUI.saveSettings();
  };

  window.enableAudio = function() {
      window.dendryUI.toggle_audio(true);
      window.dendryUI.saveSettings();
  };

  window.enableImages = function() {
      window.dendryUI.show_portraits = true;
      window.dendryUI.saveSettings();
  };

  window.disableImages = function() {
      window.dendryUI.show_portraits = false;
      window.dendryUI.saveSettings();
  };

  window.enableLightMode = function() {
      window.dendryUI.dark_mode = false;
      document.body.classList.remove('dark-mode');
      window.dendryUI.saveSettings();
  };
  window.enableDarkMode = function() {
      window.dendryUI.dark_mode = true;
      document.body.classList.add('dark-mode');
      window.dendryUI.saveSettings();
  };

  // populates the checkboxes in the options view
  window.populateOptions = function() {
    var disable_bg = window.dendryUI.disable_bg;
    var animate = window.dendryUI.animate;
    var disable_audio = window.dendryUI.disable_audio;
    var show_portraits = window.dendryUI.show_portraits;
    if (disable_bg) {
        $('#backgrounds_no')[0].checked = true;
    } else {
        $('#backgrounds_yes')[0].checked = true;
    }
    if (animate) {
        $('#animate_yes')[0].checked = true;
    } else {
        $('#animate_no')[0].checked = true;
    }
    if (disable_audio) {
        $('#audio_no')[0].checked = true;
    } else {
        $('#audio_yes')[0].checked = true;
    }
    if (show_portraits) {
        $('#images_yes')[0].checked = true;
    } else {
        $('#images_no')[0].checked = true;
    }
    if (window.dendryUI.dark_mode) {
        $('#dark_mode')[0].checked = true;
    } else {
        $('#light_mode')[0].checked = true;
    }
  };

  window.displayHand = function(hand, maxCards) {
    var $handEl = $('.hand');
    var hasOldHand = $handEl.length > 0;
    if (!hasOldHand) {
        $handEl = $('<ul>').addClass('hand');
        $('#content').append($('<hr>'));
        $('#content').append($('<p>').addClass('hand-description').text('Hand - click a card to play.'));
    } else {
        $handEl.empty();
    }

    for (var i = 0; i < maxCards; i++) {
        var $cardEl = $('<li>').addClass('card-in-hand');
        if (hand[i]) {
            var card = hand[i];
            var $cardLink = $('<a>').addClass('card').attr({href: '#', 'card-id': card.id, title: card.title});
            var $title = $('<span>').addClass('card-caption').text(card.title);
            if (card.image) {
                $cardLink.append($('<img>').addClass('card-img').attr({src: card.image}));
            }
            if (card.subtitle) {
                $cardLink.append($('<span>').addClass('card-tooltip').text(card.subtitle));
            }
            var $discardBtn = $('<span>').addClass('discard-btn').attr('card-id', card.id).text('×');
            $cardEl.append($cardLink).append($title).append($discardBtn);
        } else {
            $cardEl.append($('<div>').addClass('blank-card'));
        }
        $handEl.append($cardEl);
    }

    if (!hasOldHand) {
        $('#content').append($handEl);
    }
};

  document.addEventListener('click', function(event) {
    var btn = event.target.closest && event.target.closest('.discard-btn');
    if (!btn) return;
    var content = document.getElementById('content');
    if (!content || !content.contains(btn)) return;
    event.preventDefault();
    event.stopPropagation();
    var cardId = btn.getAttribute('card-id');
    window.dendryUI.dendryEngine.discardCard(cardId);
}, true);
  
  window.displayPinnedCards = function(cards) {
    if (!cards || cards.length === 0) return null;
    var scenes = window.dendryUI.dendryEngine.game.scenes;

    var deckLike = [];
    var normal = [];
    for (var card of cards) {
        var scene = scenes[card.id];
        if (scene && scene.tags && scene.tags.indexOf('false-deck') !== -1) {
            deckLike.push(card);
        } else {
            normal.push(card);
        }
    }

    if (deckLike.length > 0) {
        var $decksEl = $('#content .decks').last();
        if ($decksEl.length === 0) {
            $decksEl = $('<ul>').addClass('decks');
            $('#content').append($decksEl);
        }
        for (var card of deckLike) {
            var $cardEl = $('<li>').addClass('deck pinned-card');
            var $cardLink = $('<a>').addClass('card').attr({href: '#', 'card-id': card.id, title: card.title});
            var $title = $('<span>').addClass('card-caption').text(card.title);
            if (card.image) {
                $cardLink.append($('<img>').addClass('card-img').attr({src: card.image}));
            }
            if (card.subtitle) {
                $cardLink.append($('<span>').addClass('card-tooltip').text(card.subtitle));
            }
            $cardEl.append($cardLink).append($title);
            $decksEl.append($cardEl);
        }
    }

    if (normal.length > 0) {
        var pinnedCardsDescription = 'Pinned cards - click a card to play.';
        if (window.pinnedCardsDescription) {
            pinnedCardsDescription = window.pinnedCardsDescription;
        }
        if (window.dendryUI.dendryEngine.state.qualities.pinnedCardsDescription) {
            pinnedCardsDescription = window.dendryUI.dendryEngine.state.qualities.pinnedCardsDescription;
        }
        $('#content').append($('<hr>'));
        $('#content').append($('<p>').addClass('pinned-text-description').text(pinnedCardsDescription));
        var $cardsEl = $('<ul>').addClass('pinned-cards');
        for (var card of normal) {
            var $cardEl = $('<li>').addClass('pinned-card');
            var $cardLink = $('<a>').addClass('card').attr({href: '#', 'card-id': card.id, title: card.title});
            var $title = $('<span>').addClass('card-caption').text(card.title);
            if (card.image) {
                $cardLink.append($('<img>').addClass('card-img').attr({src: card.image}));
            }
            if (card.subtitle) {
                $cardLink.append($('<span>').addClass('card-tooltip').text(card.subtitle));
            }
            $cardEl.append($cardLink).append($title);
            $cardsEl.append($cardEl);
        }
        $('#content').append($cardsEl);
    }
};

  document.addEventListener('click', function(event) {
    var link = event.target.closest && event.target.closest('a[card-id]');
    if (!link) return;
    var li = link.closest('li.pinned-card');
    if (!li || !li.classList.contains('deck')) return;
    var content = document.getElementById('content');
    if (!content || !content.contains(li)) return;
    event.preventDefault();
    event.stopPropagation();
    window.dendryUI.dendryEngine.playPinnedCard(link.getAttribute('card-id'));
  }, true); // true = capture phase, runs before browser.js's bubble-phase handler

  
  // This function allows you to modify the text before it's displayed.
  // E.g. wrapping chat-like messages in spans.
  window.displayText = function(text) {
      return text;
  };

  // This function allows you to do something in response to signals.
  window.handleSignal = function(signal, event, scene_id) {
  };
  
  // This function runs on a new page. Right now, this auto-saves.
  window.onNewPage = function() {
    var scene = window.dendryUI.dendryEngine.state.sceneId;
    if (scene != 'root' && !window.justLoaded) {
        window.dendryUI.autosave();
    }
    if (window.justLoaded) {
        window.justLoaded = false;
    }
  };

  // TODO: have some code for tabbed sidebar browsing.
  window.updateSidebar = function() {
      $('#qualities').empty();
      var scene = dendryUI.game.scenes[window.statusTab];
      dendryUI.dendryEngine._runActions(scene.onArrival);
      var displayContent = dendryUI.dendryEngine._makeDisplayContent(scene.content, true);
      $('#qualities').append(dendryUI.contentToHTML.convert(displayContent));
  };

  window.changeTab = function(newTab, tabId) {
      if (tabId == 'poll_tab' && dendryUI.dendryEngine.state.qualities.historical_mode) {
          window.alert('Polls are not available in historical mode.');
          return;
      }
      var tabButton = document.getElementById(tabId);
      var tabButtons = document.getElementsByClassName('tab_button');
      for (i = 0; i < tabButtons.length; i++) {
        tabButtons[i].className = tabButtons[i].className.replace(' active', '');
      }
      tabButton.className += ' active';
      window.statusTab = newTab;
      window.updateSidebar();
  };

  window.onDisplayContent = function() {
      window.updateSidebar();
  };

  /*
   * This function copied from the code for Infinite Space Battle Simulator
   *
   * quality - a number between max and min
   * qualityName - the name of the quality
   * max and min - numbers
   * colors - if true/1, will use some color scheme - green to yellow to red for high to low
   * */
  window.generateBar = function(quality, qualityName, max, min, colors) {
      var bar = document.createElement('div');
      bar.className = 'bar';
      var value = document.createElement('div');
      value.className = 'barValue';
      var width = (quality - min)/(max - min);
      if (width > 1) {
          width = 1;
      } else if (width < 0) {
          width = 0;
      }
      value.style.width = Math.round(width*100) + '%';
      if (colors) {
          value.style.backgroundColor = window.probToColor(width*100);
      }
      bar.textContent = qualityName + ': ' + quality;
      if (colors) {
          bar.textContent += '/' + max;
      }
      bar.appendChild(value);
      return bar;
  };





  window.justLoaded = true;
  window.statusTab = "status";
  window.dendryModifyUI = main;
  console.log("Modifying stats: see dendryUI.dendryEngine.state.qualities");
window.Achievements = (function () {

  // ── Registry: ─────────────────────────
  // key: id (matches the bare name passed to engine.achieve(id) —
  //   the engine itself prepends "achievement_" when setting the quality
  //   flag, so scene files should call e.g. engine.achieve('eiserne_front')
  //   to satisfy a [? if achievement_eiserne_front ?] conditional)
  // value: {title, description, icon}
  var REGISTRY = {
    eiserne_front: {
      title: 'Eiserne Front',
      description: 'form the Iron Front.',
      icon: 'img/achievements/eiserne_front.png'
    },
    civil_war: {
      title: 'Bürgerkrieg',
      description: 'enter a long civil war.',
      icon: 'img/achievements/civil_war.png'
    },
    einigkeit: {
      title: 'Einigkeit',
      description: 'reach the end of the game without a civil war on easy.',
      icon: 'img/achievements/einigkeit.png'
    },
    einigkeit_und_recht: {
      title: 'Einigkeit und Recht',
      description: 'reach the end of the game without a civil war on normal.',
      icon: 'img/achievements/einigkeit_und_recht.png'
    },
    einigkeit_und_recht_und_freiheit: {
      title: 'Einigkeit und Recht und Freiheit',
      description: 'reach the end of the game without a civil war on hard.',
      icon: 'img/achievements/einigkeit_und_recht_und_freiheit.png'
    },
    schwarz_rot_gold: {
      title: 'Schwarz-Rot-Gold',
      description: 'reach the end of the game without a civil war on historical mode.',
      icon: 'img/achievements/schwarz_rot_gold.png'
    },
    victory_for_the_republic: {
      title: 'Sieg für die Republik',
      description: 'win the civil war.',
      icon: 'img/achievements/victory_for_the_republic.png'
    },
    bollwerk_der_demokratie: {
      title: 'Bollwerk der Demokratie',
      description: 'Resist the Prussian Coup and win.',
      icon: 'img/achievements/bollwerk_der_demokratie.png'
    },
    red_tzar_of_prussia: {
      title: 'Roter Zar von Preußen',
      description: 'Otto Braun is President, Chancellor, and Minister-President.',
      icon: 'img/achievements/red_tzar_of_prussia.png'
    },
    einheitsfront: {
      title: 'Einheitsfront',
      description: 'Form a government consisting of the SPD and KPD.',
      icon: 'img/achievements/einheitsfront.png'
    },
    einheitsfront_2: {
      title: 'Sieg für die Einheitsfront',
      description: 'Form a Left Front that survives the KPD demands.',
      icon: 'img/achievements/einheitsfront_2.png'
    },
    volksfront: {
      title: 'Volksfront',
      description: 'Form a government consisting of the SPD, KPD, Z, and DDP.',
      icon: 'img/achievements/volksfront.png'
    },
    grosse_volksfront: {
      title: 'Große Volksfront',
      description: 'With Joos leading the Center Party and the Conciliators leading the KPD, form a government consisting of the SPD, KPD, Z, and DDP.',
      icon: 'img/achievements/grosse_volksfront.png'
    },
    volksfront_2: {
      title: 'Sieg für die Volksfront',
      description: 'Form a Popular Front that survives the KPD demands.',
      icon: 'img/achievements/volksfront_2.png'
    },
    constitutional_coalition: {
      title: 'Verfassungskoalition',
      description: 'form a "constitutional coalition".',
      icon: 'img/achievements/constitutional_coalition.png'
    },
    weimar_coalition: {
      title: 'Weimarer Koalition',
      description: 'form a Weimar coalition.',
      icon: 'img/achievements/weimar_coalition.png'
    },
    majority_party: {
      title: 'Mehrheitspartei',
      description: 'form an SPD-only majority government.',
      icon: 'img/achievements/majority_party.png'
    },
    minderheitsregierung: {
      title: 'Minderheitsregierung',
      description: 'form an SPD minority government.',
      icon: 'img/achievements/minderheitsregierung.png'
    },
    volkspartei: {
      title: 'Volkspartei',
      description: 'the SPD is a People\'s Party.',
      icon: 'img/achievements/volkspartei.png'
    },
    sohn_seiner_klasse: {
      title: 'Sohn seiner Klasse',
      description: 'Ernst Thälmann is either president or chancellor.',
      icon: 'img/achievements/sohn_seiner_klasse.png'
    },
    rote_millionar: {
      title: 'Der rote Millionär',
      description: 'Willi Münzenberg is president.',
      icon: 'img/achievements/rote_millionar.png'
    },
    versohnler: {
      title: 'Versöhnler',
      description: 'the Conciliators lead the KPD.',
      icon: 'img/achievements/versohnler.png'
    },
    deport_hitler: {
      title: 'Der österreichische Gefreite',
      description: 'deported Hitler',
      icon: 'img/achievements/deport_hitler.png'
    },
    wirtschaftspolitik: {
      title: 'Wirtschaftspolitik',
      description: 'enact an economic plan.',
      icon: 'img/achievements/wirtschaftspolitik.png'
    },
    wirtschaftswunder: {
      title: 'Wirtschaftswunder',
      description: 'After 1932, have unemployment less than in 1928, inflation below 5%, and a budget surplus.',
      icon: 'img/achievements/wirtschaftswunder.png'
    },
    wirtschaftsexperiment: {
      title: 'Wirtschaftsexperiment',
      description: 'enact two different economic plans.',
      icon: 'img/achievements/wirtschaftsexperiment.png'
    },
    freie_marktwirtschaft: {
      title: 'Freie Marktwirtschaft',
      description: 'survive to the end of the game without adopting an economic plan.',
      icon: 'img/achievements/freie_marktwirtschaft.png'
    },
    equality: {
      title: 'Gleichheit',
      description: 'pass reforms for women\'s rights.',
      icon: 'img/achievements/equality.png'
    },
    hirschfeld: {
      title: 'Hirschfeld',
      description: 'pass reforms for homosexual rights.',
      icon: 'img/achievements/hirschfeld.png'
    },
    women_reichsbanner: {
      title: 'Mädchen in Uniform',
      description: 'a woman\'s place is in the Reichsbanner.',
      icon: 'img/achievements/women_reichsbanner.png'
    },
    anders_als_die_andern: {
      title: 'Anders als die Andern',
      description: 'sexual minorities will defend the Republic.',
      icon: 'img/achievements/anders_als_die_andern.png'
    },
    bruder_zur_sonne: {
      title: 'Brüder, zur Sonne, zur Freiheit',
      description: 'reduce unemployment, pause reparations, increase women\'s rights, elect an SPD president, and deport Hitler in one playthrough on at least normal difficulty.',
      icon: 'img/achievements/bruder_zur_sonne.png'
    },
    die_rote_fahne: {
      title: 'Die Rote Fahne',
      description: 'join the KPD in their May Day march.',
      icon: 'img/achievements/die_rote_fahne.png'
    },
    panik_im_mittelstand: {
      title: 'Panik im Mittelstand',
      description: 'SPD new middle class support is at least 50%.',
      icon: 'img/achievements/panik_im_mittelstand.png'
    },
    bauernrevolution: {
      title: 'Bauernrevolution',
      description: 'SPD rural support is at least 50%.',
      icon: 'img/achievements/bauernrevolution.png'
    },
    katholischer_sozialismus: {
      title: 'Katholischer Sozialismus',
      description: 'SPD Catholic support is at least 50%.',
      icon: 'img/achievements/katholischer_sozialismus.png'
    },
    grosse_volkspartei: {
      title: 'Große Volkspartei',
      description: 'All classes have at least 40% SPD support.',
      icon: 'img/achievements/grosse_volkspartei.png'
    },
    klassenkampf: {
      title: 'Klassenkampf',
      description: 'SPD worker support is at least 80%, while middle-class and rural supports are less than 20%.',
      icon: 'img/achievements/klassenkampf.png'
    },
    raterepublik: {
      title: 'Räterepublik',
      description: 'begin the transformation to a socialist economy.',
      icon: 'img/achievements/raterepublik.png'
    },
    polykrise: {
      title: 'Polykrise',
      description: 'survive a capital strike and a fascist coup.',
      icon: 'img/achievements/polykrise.png'
    },
    syndikalismus: {
      title: 'Syndikalismus',
      description: 'support factory takeovers by the workers.',
      icon: 'img/achievements/syndikalismus.png'
    },
    drei_pfeile: {
      title: 'Drei Pfeile',
      description: 'defeat a coup without a civil war.',
      icon: 'img/achievements/drei_pfeile.png'
    },
    ausnahmezustand: {
      title: 'Ausnahmezustand',
      description: 'use emergency powers to cancel elections.',
      icon: 'img/achievements/ausnahmezustand.png'
    },
    eu: {
      title: 'Vereinigte Staaten von Europa',
      description: 'form a "European Union".',
      icon: 'img/achievements/eu.png'
    },
    heidelberger_programm: {
      title: 'Heidelberger Programm',
      description: 'achieve the goals of the SPD\'s Heidelberg Program: social welfare, judicial reform, women\'s rights in the workplace and family, progressive taxation, works councils, and the formation of a European Union.',
      icon: 'img/achievements/heidelberger_programm.png'
    },
    verfassungsreform: {
      title: 'Verfassungsreform',
      description: 'pass a constitutional amendment.',
      icon: 'img/achievements/verfassungsreform.png'
    },
    zeppelin_kapitan: {
      title: 'Zeppelinkapitän',
      description: 'Hugo Eckener has been elected president.',
      icon: 'img/achievements/zeppelin_kapitan.png'
    },
    wahlrechts: {
      title: 'Wahlrechts für Frauen',
      description: 'Marie Juchacz has been elected president.',
      icon: 'img/achievements/wahlrechts.png'
    },
    bundesrepublik: {
      title: 'Bundesrepublik',
      description: 'Konrad Adenauer or Kurt Schumacher has been elected president, and constitutional reforms have reduced presidential power.',
      icon: 'img/achievements/bundesrepublik.png'
    },
    republik_der_wissenschaft: {
      title: 'Republik der Wissenschaft',
      description: 'Albert Einstein has been elected president.',
      icon: 'img/achievements/republik_der_wissenschaft.png'
    },
    arbeiter_von_wien: {
      title: 'Arbeiter von Wien',
      description: 'SDAPÖ victory in Austria.',
      icon: 'img/achievements/arbeiter_von_wien.png'
    },
    stolperstein: {
      title: 'Stolperstein',
      description: 'we lost, but history might memorialize us...',
      icon: 'img/achievements/stolperstein.png'
    }
  };

  var DEFAULT_DURATION = 5000;

  var _queue = [];
  var _showing = false;
  var _container = null;

  // Cached engine reference, set once by _patchAchieve(). Avoids re-resolving
  // window.dendryUI.dendryEngine on every isUnlocked()/unlock() call, and
  // avoids silently drifting if window.dendryUI is ever reassigned later
  // (e.g. loadGame() swapping in a new engine instance for a mod).
  var _engine = null;

  function _init() {
    if (_container) return;
    _container = document.createElement('div');
    _container.id = 'achievement-popup-container';
    document.body.appendChild(_container);
  }

  function _getUnlocked() {
    if (!_engine) return {};
    if (!_engine.state.achievementsUnlocked) {
      _engine.state.achievementsUnlocked = {};
    }
    return _engine.state.achievementsUnlocked;
  }

  function isUnlocked(id) {
    return !!_getUnlocked()[id];
  }

  function getAll() {
    return REGISTRY;
  }

  function getUnlockedList() {
    var unlocked = _getUnlocked();
    return Object.keys(REGISTRY).filter(function (id) { return unlocked[id]; });
  }

  // ── Unlock + queue a popup ────────────────────────────────────────
  function unlock(id, opts) {
    opts = opts || {};
    var def = REGISTRY[id] || {};
    var title = opts.title || def.title || id;
    var description = opts.description || def.description || '';
    var icon = opts.icon || def.icon || null;
    var allowRepeat = opts.allowRepeat === true;
    var duration = opts.duration != null ? opts.duration : DEFAULT_DURATION;

    var unlocked = _getUnlocked();
    if (unlocked[id] && !allowRepeat) {
      return false; // already unlocked, don't re-notify
    }
    unlocked[id] = true;

    _queue.push({ title: title, description: description, icon: icon, duration: duration });
    _runQueue();
    return true;
  }

  function _runQueue() {
    if (_showing || _queue.length === 0) return;
    _showing = true;
    var item = _queue.shift();
    _show(item, function () {
      _showing = false;
      _runQueue();
    });
  }

  function _show(item, onDone) {
    _init();

    var el = document.createElement('div');
    el.className = 'achievement-popup';

    var iconHtml = item.icon
      ? '<img class="achievement-popup-icon" src="' + item.icon + '" alt="">'
      : '<div class="achievement-popup-icon achievement-popup-icon-default">&#9733;</div>';

    el.innerHTML =
      iconHtml +
      '<div class="achievement-popup-text">' +
        '<div class="achievement-popup-label">Achievement Unlocked</div>' +
        '<div class="achievement-popup-title"></div>' +
        (item.description ? '<div class="achievement-popup-desc"></div>' : '') +
      '</div>';

    // Set text via textContent to avoid injection issues from dynamic strings
    el.querySelector('.achievement-popup-title').textContent = item.title;
    if (item.description) {
      el.querySelector('.achievement-popup-desc').textContent = item.description;
    }

    _container.appendChild(el);

    // Force reflow then animate in. A single rAF is sufficient for a
    // class-toggle transition (no inline-style flush needed).
    requestAnimationFrame(function () {
      el.classList.add('active');
    });

    var closeTimer = setTimeout(function () { _hide(el, onDone); }, item.duration);

    el.addEventListener('click', function () {
      clearTimeout(closeTimer);
      _hide(el, onDone);
    });
  }

  function _hide(el, onDone) {
    el.classList.remove('active');
    el.classList.add('leaving');
    setTimeout(function () {
      el.remove();
      if (onDone) onDone();
    }, 400);
  }

  // ── Engine patching ─────────────────────────────────────────────
  // Wraps engine.achieve() so every achievement grant also queues a popup.
  // Exposed as `patch` on the returned object so a page's main
  // dendryModifyUI can call it directly instead of relying on load order
  // (see note below on the chaining fallback).
  function _patchAchieve(engine) {
    _engine = engine;

    if (typeof engine.achieve !== 'function') {
      console.warn('Achievements: engine.achieve() not found — check dendry version.');
      return;
    }

    var _originalAchieve = engine.achieve.bind(engine);
    engine.achieve = function (name) {
      var alreadyHad = !!(this.state.achievements && this.state.achievements[name]);
      var result = _originalAchieve(name);
      if (!alreadyHad) {
        unlock(name); // registry lookup happens once, inside unlock()
      }
      return result;
    };
  }

  // Chain onto window.dendryModifyUI as a fallback, so this file cooperates
  // with other mods that also want to hook in via that same mechanism.
  //
  // IMPORTANT: this chaining only works if this script runs AFTER any other
  // script that also does `window.dendryModifyUI = something;` with a plain
  // assignment. If a later script overwrites window.dendryModifyUI outright,
  // this wrapper is lost and achievements stop firing silently.
  //
  // The safer alternative used by this project's game.js: call
  // window.Achievements.patch(dendryUI.dendryEngine) directly from inside
  // its own main(dendryUI), which has no load-order dependency at all.
  var _existingModifyUI = window.dendryModifyUI;
  window.dendryModifyUI = function (dendryUI) {
    var result;
    if (typeof _existingModifyUI === 'function') {
      result = _existingModifyUI(dendryUI);
    }
    _patchAchieve(dendryUI.dendryEngine);
    return result;
  };

  return {
    unlock: unlock,
    isUnlocked: isUnlocked,
    getAll: getAll,
    getUnlockedList: getUnlockedList,
    patch: _patchAchieve,
    registry: REGISTRY
  };

})();


  window.onload = function() {
    window.dendryUI.loadSettings({show_portraits: true});
    if (window.dendryUI.dark_mode) {
        document.body.classList.add('dark-mode');
    }
    window.pinnedCardsDescription = "Advisor cards - actions are only usable once per 6 months.";
  };

}());
