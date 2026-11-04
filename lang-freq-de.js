'use strict';
/* 1000 самых частых немецких слов (по частотному списку OpenSubtitles/FrequencyWords), отобраны и переведены вручную.
   Существительные — с артиклем, глаголы — в начальной форме. Слова из базовых тем пропускаются автоматически. */
(window.FREQ ||= {}).de = `ich|я
du|ты
er|он
sie|она; они
es|оно, это
wir|мы
ihr|вы
mich|меня
mir|мне
dich|тебя
dir|тебе
ihn|его
ihm|ему
uns|нас, нам
euch|вас, вам
mein|мой
dein|твой
unser|наш
euer|ваш
das|это; (артикль ср. рода)
was|что
wer|кто
wo|где
wohin|куда
woher|откуда
wann|когда
warum|почему
wieso|отчего, почему
wie|как
welcher|который
hier|здесь
dort|там
da|тут, там
dann|потом, тогда
nicht|не
kein|никакой, нет
alles|всё
alle|все
etwas|что-то, немного
nichts|ничего
jemand|кто-то
niemand|никто
man|(безличное) «люди», «ты»
viel|много
mehr|больше
sehr|очень
auch|тоже
nur|только
noch|ещё
schon|уже
wieder|снова
mal|раз; -ка
doch|всё-таки, же
also|итак, значит
vielleicht|может быть
wirklich|действительно
einfach|просто
ganz|совсем, целый
genau|точно
gerade|как раз, сейчас
sofort|сразу
bald|скоро
später|позже
früher|раньше
gleich|сейчас же; одинаковый
selbst|сам
zusammen|вместе
allein|один, одна
und|и
aber|но
oder|или
denn|ведь, так как
weil|потому что
wenn|если, когда
dass|что (союз)
ob|ли
bis|до
mit|с
ohne|без
für|для
von|от, из
zu|к
aus|из
bei|у, при
nach|после; в (город)
vor|перед
über|над; о
unter|под
auf|на
in|в
durch|через
gegen|против
um|вокруг; в (о времени)
seit|с (какого-то времени)
hinter|за, позади
neben|рядом с
zwischen|между
während|во время
wegen|из-за
trotzdem|несмотря на это
sondern|а (после отрицания)
deshalb|поэтому
sonst|иначе
fast|почти
etwa|примерно
ziemlich|довольно
besonders|особенно
natürlich|конечно
sicher|уверенный; наверняка
klar|ясно
eigentlich|собственно, вообще-то
endlich|наконец
leider|к сожалению
gern|охотно
lieber|лучше (охотнее)
bestimmt|определённо
wahrscheinlich|вероятно
übrigens|кстати
überall|везде
irgendwo|где-нибудь
oben|наверху
unten|внизу
draußen|снаружи
drinnen|внутри
zurück|назад
weg|прочь
los|вперёд!; оторвался
okay|окей
danke schön|большое спасибо
Entschuldigung bitte|простите, пожалуйста
der Herr|господин
die Dame|дама
die Leute|люди
der Junge|мальчик, парень
das Mädchen|девочка, девушка
der Typ|тип, парень
die Eltern|родители
der Onkel|дядя
die Tante|тётя
die Oma|бабушка
der Opa|дедушка
die Freundin|подруга, девушка
der Ehemann|муж
die Ehefrau|жена
der Nachbar|сосед
der Gast|гость
der Arzt|врач
der Lehrer|учитель
der Student|студент
die Polizei|полиция
der Polizist|полицейский
der König|король
die Königin|королева
der Präsident|президент
der Soldat|солдат
der Feind|враг
der Anwalt|адвокат
der Richter|судья
der Mörder|убийца
das Opfer|жертва
der Kumpel|приятель
der Liebling|любимый, дорогой
das Leben|жизнь
die Welt|мир
die Zeit|время
das Ding|вещь, штука
die Sache|дело, вещь
der Ort|место
die Art|вид, способ
der Weg|путь, дорога
der Fall|случай
der Grund|причина
das Problem|проблема
die Frage|вопрос
die Antwort|ответ
die Idee|идея
die Ahnung|понятие, представление
die Wahrheit|правда
die Lüge|ложь
die Geschichte|история
die Nachricht|сообщение, новость
das Wort|слово
die Sprache|язык
die Nummer|номер
der Teil|часть
das Ende|конец
der Anfang|начало
die Seite|сторона, страница
die Mitte|середина
der Punkt|точка, пункт
die Chance|шанс
die Wahl|выбор
der Plan|план
der Fehler|ошибка
das Glück|счастье, удача
der Spaß|удовольствие, шутка
das Spiel|игра
die Party|вечеринка
das Geschenk|подарок
die Überraschung|сюрприз
der Traum|мечта, сон
die Angst|страх
die Hoffnung|надежда
die Liebe|любовь
das Herz|сердце
der Kopf|голова
das Gesicht|лицо
das Auge|глаз
das Ohr|ухо
die Nase|нос
der Mund|рот
das Haar|волос
die Hand|рука (кисть)
der Arm|рука
der Finger|палец
das Bein|нога
der Fuß|ступня
der Rücken|спина
der Körper|тело
das Blut|кровь
die Haut|кожа
die Stimme|голос
der Hals|горло, шея
der Zahn|зуб
der Bauch|живот
die Seele|душа
der Geist|дух, разум
der Tod|смерть
der Schmerz|боль
die Gesundheit|здоровье
der Geburtstag|день рождения
die Hochzeit|свадьба
das Wochenende|выходные
Weihnachten|Рождество
der Moment|момент
der Augenblick|мгновение
die Sekunde|секунда
die Uhr|часы; (который) час
die Zukunft|будущее
die Vergangenheit|прошлое
der Frühling|весна
der Herbst|осень
der Mittag|полдень
die Mitternacht|полночь
das Licht|свет
das Feuer|огонь
die Luft|воздух
der Boden|пол, земля
die Erde|Земля, земля
der Himmel|небо
der Stern|звезда
der Mond|луна
der Wind|ветер
der Fluss|река
der See|озеро
der Wald|лес
der Baum|дерево
die Blume|цветок
das Gras|трава
der Stein|камень
die Insel|остров
der Strand|пляж
das Feld|поле
das Dorf|деревня
das Land|страна, земля
der Hund|собака
die Katze|кошка
das Pferd|лошадь
der Vogel|птица
die Kuh|корова
das Schwein|свинья
das Huhn|курица
die Maus|мышь
der Bär|медведь
der Wolf|волк
das Tier|животное
die Wohnung|квартира
der Garten|сад
die Wand|стена
das Dach|крыша
die Treppe|лестница
das Bad|ванная
das Schlafzimmer|спальня
die Toilette|туалет
die Dusche|душ
der Spiegel|зеркало
die Lampe|лампа
das Sofa|диван
das Kissen|подушка
die Decke|одеяло; потолок
das Handtuch|полотенце
die Seife|мыло
der Kühlschrank|холодильник
der Ofen|печь, духовка
der Herd|плита
der Müll|мусор
der Aufzug|лифт
der Teppich|ковёр
der Vorhang|штора
das Regal|полка
die Tasche|сумка, карман
die Kiste|ящик, коробка
die Flasche|бутылка
das Glas|стакан, стекло
die Tasse|чашка
der Teller|тарелка
das Messer|нож
die Gabel|вилка
der Löffel|ложка
das Getränk|напиток
der Wein|вино
das Bier|пиво
der Saft|сок
der Reis|рис
die Kartoffel|картофель
die Tomate|помидор
das Gemüse|овощи
das Obst|фрукты
das Rindfleisch|говядина
das Schweinefleisch|свинина
die Butter|сливочное масло
das Öl|масло (растительное)
der Kuchen|пирог, торт
die Schokolade|шоколад
das Eis|мороженое; лёд
die Pizza|пицца
der Salat|салат
die Nudeln|макароны
die Zwiebel|лук
der Knoblauch|чеснок
die Karotte|морковь
die Gurke|огурец
der Pfeffer|перец
die Zitrone|лимон
die Banane|банан
die Orange|апельсин
die Trauben|виноград
die Erdbeere|клубника
die Kirsche|вишня
die Nuss|орех
der Honig|мёд
die Marmelade|варенье
der Keks|печенье
die Soße|соус
das Mehl|мука
die Kleidung|одежда
das Hemd|рубашка
das Kleid|платье
die Schuhe|обувь
der Hut|шляпа
der Mantel|пальто
die Jacke|куртка
die Hose|брюки
der Ring|кольцо
die Brille|очки
der Regenschirm|зонт
das Bild|картина
das Foto|фотография
die Musik|музыка
das Lied|песня
der Film|фильм
die Zeitung|газета
das Buch|книга
die Zeitschrift|журнал
das Fernsehen|телевидение
der Fernseher|телевизор
das Handy|мобильный телефон
die Kamera|фотоаппарат, камера
das Internet|интернет
die E-Mail|электронное письмо
das Papier|бумага
der Stift|ручка
der Bleistift|карандаш
die Klasse|класс
die Prüfung|экзамен
die Universität|университет
die Wissenschaft|наука
die Kunst|искусство
der Sport|спорт
der Ball|мяч
der Fußball|футбол
die Waffe|оружие
der Krieg|война
der Frieden|мир (не война)
die Armee|армия
der Kampf|борьба, бой
das Gesetz|закон
das Gericht|суд; блюдо
das Gefängnis|тюрьма
das Verbrechen|преступление
der Mord|убийство
der Beweis|доказательство
das Geheimnis|тайна
die Regierung|правительство
der Staat|государство
die Macht|власть
die Kontrolle|контроль
das System|система
die Ordnung|порядок
die Regel|правило
die Information|информация
die Gefahr|опасность
der Unfall|авария, несчастный случай
die Hilfe|помощь
das Medikament|лекарство
die Krankenschwester|медсестра
die Erkältung|простуда
das Fieber|температура (жар)
die Kopfschmerzen|головная боль
die Hitze|жара
der Nebel|туман
die Wolke|облако
der Sturm|буря
der Norden|север
der Süden|юг
der Osten|восток
der Westen|запад
das Zentrum|центр
die Ecke|угол
die Brücke|мост
der Ausgang|выход
der Eingang|вход
die Haltestelle|остановка
das Flugzeug|самолёт
das Schiff|корабль
das Boot|лодка
das Fahrrad|велосипед
das Taxi|такси
die Reise|поездка, путешествие
der Flug|полёт, рейс
das Gepäck|багаж
die Grenze|граница
der Tourist|турист
das Museum|музей
die Kirche|церковь
das Schloss|замок (дворец)
die Gegend|местность, район
die Adresse|адрес
die Fabrik|фабрика
der Bauernhof|ферма
der Kunde|клиент
der Verkäufer|продавец
der Besitzer|владелец
der Partner|партнёр
die Firma|фирма
der Vertrag|договор
die Erfahrung|опыт
das Projekt|проект
die Aufgabe|задача
das Ergebnis|результат
der Erfolg|успех
das Ziel|цель
das Beispiel|пример
der Unterschied|разница
die Größe|размер
die Farbe|цвет
das Gewicht|вес
das Alter|возраст
die Hälfte|половина
das Paar|пара
tausend|тысяча
die Million|миллион
elf|одиннадцать
zwölf|двенадцать
zwanzig|двадцать
dreißig|тридцать
fünfzig|пятьдесят
Montag|понедельник
Dienstag|вторник
Mittwoch|среда
Donnerstag|четверг
Freitag|пятница
Samstag|суббота
Sonntag|воскресенье
Januar|январь
Februar|февраль
März|март
April|апрель
Mai|май
Juni|июнь
Juli|июль
August|август
September|сентябрь
Oktober|октябрь
November|ноябрь
Dezember|декабрь
gelb|жёлтый
braun|коричневый
grau|серый
rosa|розовый
lila|фиолетовый
dunkel|тёмный
hell|светлый
warm|тёплый
kühl|прохладный
nass|мокрый
trocken|сухой
sauber|чистый
schmutzig|грязный
schwer|тяжёлый; трудный
dick|толстый
dünn|тонкий
breit|широкий
eng|узкий, тесный
tief|глубокий
rund|круглый
scharf|острый
hoch|высокий
niedrig|низкий
lang|длинный
kurz|короткий
jung|молодой
früh|рано, ранний
spät|поздно, поздний
stark|сильный
schwach|слабый
voll|полный
leer|пустой
frei|свободный
beschäftigt|занятой
offen|открытый
geschlossen|закрытый
gefährlich|опасный
wichtig|важный
möglich|возможный
unmöglich|невозможный
seltsam|странный
komisch|смешной, странный
lustig|весёлый
verrückt|сумасшедший
dumm|глупый
klug|умный
hübsch|симпатичный
hässlich|некрасивый
reich|богатый
arm|бедный
krank|больной
müde|усталый
hungrig|голодный
wütend|злой
sauer|кислый; сердитый
ruhig|спокойный, тихий
laut|громкий
leise|тихий
süß|сладкий, милый
lieb|милый, добрый
perfekt|идеальный
wunderbar|чудесный
toll|классный
super|супер
großartig|великолепный
schrecklich|ужасный
schlimm|плохой (серьёзный)
ernst|серьёзный
richtig|правильный
falsch|неправильный
wahr|верный, правдивый
tot|мёртвый
lebendig|живой
bereit|готовый
froh|довольный, радостный
traurig|грустный
stolz|гордый
nervös|нервный
ehrlich|честный
mutig|смелый
faul|ленивый
freundlich|дружелюбный
höflich|вежливый
unhöflich|невежливый
einsam|одинокий
verheiratet|женатый, замужняя
ledig|холостой
berühmt|знаменитый
bekannt|известный
öffentlich|общественный
privat|частный
fremd|чужой, иностранный
modern|современный
normal|нормальный
persönlich|личный
gesund|здоровый
lecker|вкусный
frisch|свежий
salzig|солёный
bitter|горький
roh|сырой
gekocht|варёный
gebraten|жареный
nützlich|полезный
nötig|необходимый
oft|часто
selten|редко
plötzlich|вдруг
vorsichtig|осторожный
heute Abend|сегодня вечером
damals|тогда (в прошлом)
vorher|до этого
nachher|после этого
danach|затем
zuerst|сначала
schließlich|в конце концов
einmal|однажды, один раз
zweimal|дважды
jeder|каждый
beide|оба
einige|некоторые
mehrere|несколько
wenig|мало
weniger|меньше
genug|достаточно
halb|половинный, пол-
außer|кроме
statt|вместо
obwohl|хотя
damit|чтобы; этим
bevor|прежде чем
nachdem|после того как
sobald|как только
kommen|приходить
geben|давать
nehmen|брать
sagen|сказать
fragen|спрашивать
antworten|отвечать
denken|думать
glauben|верить, полагать
finden|находить
kennen|знать (быть знакомым)
können|мочь, уметь
müssen|быть должным
sollen|следовать (быть должным)
dürfen|иметь право
mögen|любить, нравиться
möchten|хотеть (вежливо)
werden|становиться
lassen|оставлять, позволять
bleiben|оставаться
stehen|стоять
sitzen|сидеть
liegen|лежать
legen|класть
stellen|ставить
setzen|сажать
hören|слышать
zuhören|слушать
schauen|смотреть
zeigen|показывать
bringen|приносить
holen|забирать, приносить
tragen|нести; носить
halten|держать
helfen|помогать
brauchen|нуждаться
warten|ждать
treffen|встречать
besuchen|посещать
reden|говорить, разговаривать
erzählen|рассказывать
erklären|объяснять
schreiben|писать
lesen|читать
spielen|играть
laufen|бежать, идти
fahren|ехать
fliegen|летать
gewinnen|выигрывать
verlieren|терять, проигрывать
vergessen|забывать
erinnern|напоминать, помнить
hoffen|надеяться
fühlen|чувствовать
versuchen|пытаться
anfangen|начинать
aufhören|прекращать
beenden|заканчивать
öffnen|открывать
schließen|закрывать
ändern|менять
passieren|случаться
sterben|умирать
töten|убивать
retten|спасать
schützen|защищать
kämpfen|бороться
schießen|стрелять
fangen|ловить
werfen|бросать
fallen|падать
ziehen|тянуть
drücken|нажимать, давить
schlagen|бить
brechen|ломать
reparieren|чинить
schneiden|резать
berühren|трогать
küssen|целовать
umarmen|обнимать
lachen|смеяться
weinen|плакать
lächeln|улыбаться
singen|петь
tanzen|танцевать
lehren|учить (кого-то)
studieren|учиться в вузе
üben|упражняться
wiederholen|повторять
übersetzen|переводить
entscheiden|решать
wählen|выбирать
wünschen|желать
versprechen|обещать
vorstellen|представлять
vermuten|предполагать
scheinen|казаться
bauen|строить
wachsen|расти
teilen|делить(ся)
reisen|путешествовать
ankommen|прибывать
genießen|наслаждаться
heiraten|жениться, выходить замуж
anziehen|надевать
ausziehen|снимать; съезжать
kochen|готовить, варить
braten|жарить
putzen|убирать, чистить
waschen|мыть
aufwachen|просыпаться
aufstehen|вставать
sich setzen|садиться
sich beeilen|торопиться
sich beruhigen|успокаиваться
sich freuen|радоваться
sich kümmern|заботиться
sich treffen|встречаться
sich vorstellen|представляться; представлять себе
sich entschuldigen|извиняться
sich ausruhen|отдыхать
sich verlieben|влюбляться
sich fühlen|чувствовать себя
bedeuten|означать
gehören|принадлежать
gefallen|нравиться
schmecken|быть на вкус
riechen|пахнуть, нюхать
bestellen|заказывать
mieten|снимать (жильё)
leihen|одалживать
ausgeben|тратить
verdienen|зарабатывать; заслуживать
sparen|экономить, копить
kosten|стоить
vergleichen|сравнивать
beschreiben|описывать
besprechen|обсуждать
streiten|спорить, ссориться
sich beschweren|жаловаться
danken|благодарить
einladen|приглашать
ablehnen|отклонять
anbieten|предлагать
empfehlen|рекомендовать
vorbereiten|готовить(ся)
planen|планировать
organisieren|организовывать
schaffen|справиться; создать
erreichen|достигать
verbessern|улучшать
benutzen|использовать
funktionieren|работать (о технике)
ausmachen|выключать
anmachen|включать
herunterladen|скачивать
drucken|печатать
klicken|нажимать (мышкой)
löschen|удалять
speichern|сохранять
verbinden|соединять
laden|заряжать; загружать
schicken|отправлять
bekommen|получать
klopfen|стучать
klingeln|звонить (в дверь)
springen|прыгать
klettern|лазать
atmen|дышать
bluten|кровоточить
brennen|гореть
frieren|мёрзнуть
regnen|идти (о дожде)
schneien|идти (о снеге)
passen|подходить
hängen|висеть
fehlen|не хватать
stimmen|быть правильным
dauern|длиться
gewöhnen|привыкать
verstecken|прятать
entdecken|открывать (находить)
erfinden|изобретать
lösen|решать (задачу)
feiern|праздновать
gratulieren|поздравлять
vergeben|прощать
lügen|лгать
betrügen|обманывать
respektieren|уважать
vermissen|скучать
sich trennen|расставаться
füttern|кормить
beten|молиться
verhaften|арестовывать
verraten|предавать
befehlen|приказывать
gehorchen|подчиняться
melden|сообщать
beweisen|доказывать
zugeben|признавать
leugnen|отрицать
zweifeln|сомневаться
erwarten|ожидать
bemerken|замечать
erkennen|узнавать
entkommen|сбегать
verfolgen|преследовать
angreifen|нападать
zerstören|разрушать
verschwinden|исчезать
erscheinen|появляться
existieren|существовать
weitermachen|продолжать
mitnehmen|брать с собой
abholen|забирать (кого-то)
zurückkommen|возвращаться
einkaufen|делать покупки
umziehen|переезжать
aussehen|выглядеть
ausgehen|выходить (развлекаться)
einschlafen|засыпать
aufpassen|быть внимательным
die Arbeitsstelle|место работы
die Bewerbung|заявление (о приёме)
das Vorstellungsgespräch|собеседование
die Gesellschaft|общество
das Volk|народ
die Stadtmitte|центр города
die Bibliothek|библиотека
das Kino|кинотеатр
das Theater|театр
das Fitnessstudio|спортзал
der Supermarkt|супермаркет
die Bäckerei|пекарня
die Post|почта
die Polizeiwache|полицейский участок
der Parkplatz|парковка
die Temperatur|температура
die Jahreszeit|время года
die Gewohnheit|привычка
die Laune|настроение
der Geschmack|вкус
der Geruch|запах
der Lärm|шум
die Stille|тишина
die Mode|мода
der Stil|стиль
die Qualität|качество
die Menge|количество
das Gefühl|чувство
die Meinung|мнение
der Sinn|смысл
die Möglichkeit|возможность
die Entscheidung|решение
die Beziehung|отношения
der Respekt|уважение
die Ehre|честь
der Mut|смелость
die Kraft|сила
die Ruhe|покой
die Freude|радость
der Witz|шутка
die Rolle|роль
das Schicksal|судьба
die Situation|ситуация
die Lage|положение
die Richtung|направление
der Schritt|шаг
die Bewegung|движение
die Verbindung|связь
der Kontakt|контакт
die Liste|список
der Bericht|отчёт
die Rechnung|счёт
die Kasse|касса
das Bargeld|наличные
der Schein|купюра
die Münze|монета
das Konto|счёт (в банке)
die Steuer|налог
die Miete|арендная плата
der Lohn|заработная плата
der Kredit|кредит
die Schulden|долги
das Angebot|предложение
der Rabatt|скидка
die Quittung|чек
der Laden|магазин, лавка
der Markt|рынок
das Paket|посылка
die Lieferung|доставка
der Kellner|официант
die Speisekarte|меню
das Trinkgeld|чаевые
das Frühstücksei|яйцо к завтраку
die Kneipe|пивная, бар
der Durst|жажда
der Hunger|голод
die Schwiegermutter|свекровь, тёща
der Enkel|внук
die Enkelin|внучка
der Cousin|двоюродный брат
die Cousine|двоюродная сестра
die Kollegen|коллеги
der Bürgermeister|мэр
der Pfarrer|священник
der Bauer|крестьянин, фермер
der Koch|повар
der Fahrer|водитель
der Pilot|пилот
der Ingenieur|инженер
der Künstler|художник
der Sänger|певец
der Schauspieler|актёр
der Journalist|журналист
der Programmierer|программист
die Rente|пенсия
das Rathaus|ратуша
die Botschaft|посольство
der Ausweis|удостоверение личности
das Formular|бланк
die Unterschrift|подпись
der Termin|назначенная встреча, приём
die Versicherung|страховка
das Rezept|рецепт
die Tablette|таблетка
die Verletzung|травма
die Wunde|рана
der Husten|кашель
der Schnupfen|насморк
die Allergie|аллергия
der Zahnarzt|стоматолог
die Brust|грудь
die Schulter|плечо
das Knie|колено
der Magen|желудок
das Gehirn|мозг
der Knochen|кость
das Herzklopfen|сердцебиение
das Jahrhundert|век
die Uhrzeit|время (на часах)
der Kalender|календарь
das Datum|дата
die Ferien|каникулы
der Feiertag|праздничный день
das Fest|праздник
die Kerze|свеча
der Ski|лыжи
das Schwimmbad|бассейн
das Ufer|берег
die Küste|побережье
der Hügel|холм
das Tal|долина
die Wüste|пустыня
der Hafen|порт
der Turm|башня
das Denkmal|памятник
die Kreuzung|перекрёсток
die Ampel|светофор
der Bürgersteig|тротуар
die U-Bahn|метро
die Straßenbahn|трамвай
der Fahrplan|расписание
die Verspätung|опоздание
der Sitzplatz|сидячее место
das Gleis|путь (платформа)
der Schalter|окошко (касса); выключатель
die Anmeldung|регистрация
der Schlüsselbund|связка ключей
die Steckdose|розетка
der Akku|аккумулятор
das Ladegerät|зарядное устройство
das Passwort|пароль
die Webseite|сайт
die App|приложение
der Bildschirm|экран
die Tastatur|клавиатура
die Datei|файл
das Programm|программа
die Software|программное обеспечение
der Drucker|принтер`;
