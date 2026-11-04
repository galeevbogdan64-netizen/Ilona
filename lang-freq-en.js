'use strict';
/* 1000 самых частых английских слов (по частотному списку OpenSubtitles/FrequencyWords), отобраны и переведены вручную.
   Формат: слово|перевод. Глаголы — с to. Слова, которые уже есть в базовых темах, пропускаются автоматически. */
(window.FREQ ||= {}).en = `I|я
you|ты, вы
he|он
she|она
it|это, оно
we|мы
they|они
me|меня, мне
him|его, ему
her|её, ей
us|нас, нам
them|их, им
my|мой
your|твой, ваш
his|его (принадлежность)
our|наш
their|их (принадлежность)
this|этот, это
that|тот, то; что (союз)
these|эти
those|те
what|что
who|кто
where|где, куда
when|когда
why|почему
how|как
which|который
here|здесь
there|там
then|тогда, потом
not|не
all|все, всё
some|некоторые, немного
any|любой, какой-нибудь
every|каждый
many|много (исчисл.)
much|много (неисчисл.)
more|больше
most|больше всего, самый
very|очень
too|тоже; слишком
also|также
only|только
just|просто, только что
still|всё ещё
already|уже
again|снова
really|действительно
maybe|может быть
and|и
but|но
or|или
because|потому что
if|если
so|так, поэтому
than|чем
with|с
without|без
for|для
about|о, про
from|из, от
to|к, в (направление)
in|в
on|на
at|у, в (месте)
up|вверх
down|вниз
out|наружу
over|над, через
under|под
after|после
before|до, перед
into|в (внутрь)
through|через, сквозь
around|вокруг
between|между
behind|позади
near|рядом
something|что-то
anything|что-нибудь
nothing|ничего
everything|всё
someone|кто-то
anyone|кто-нибудь
everyone|все (люди)
nobody|никто
somewhere|где-то
everywhere|везде
thing|вещь
way|путь, способ
place|место
time|время, раз
life|жизнь
world|мир
people|люди
guy|парень
girl|девушка, девочка
boy|мальчик, парень
baby|малыш
wife|жена
husband|муж
parents|родители
to get|получать, становиться
to come|приходить
to think|думать
to look|смотреть, выглядеть
to tell|рассказывать, говорить
to say|сказать
to take|брать
to make|делать, создавать
to give|давать
to need|нуждаться
to let|позволять
to mean|значить, иметь в виду
to find|находить
to feel|чувствовать
to keep|держать, продолжать
to leave|уходить, оставлять
to try|пытаться, пробовать
to help|помогать
to stop|останавливать(ся)
to wait|ждать
to put|класть, ставить
to believe|верить
to hear|слышать
to listen|слушать
to remember|помнить
to forget|забывать
to ask|спрашивать
to answer|отвечать
to stay|оставаться
to happen|случаться
to move|двигаться, переезжать
to bring|приносить
to start|начинать
to finish|заканчивать
to run|бежать
to walk|ходить пешком
to sit|сидеть
to stand|стоять
to open|открывать
to close|закрывать
to play|играть
to watch|смотреть (смотреть фильм)
to read|читать
to write|писать
to change|менять
to hope|надеяться
to like|нравиться
to hate|ненавидеть
to kill|убивать
to die|умирать
to meet|встречать
to show|показывать
to turn|поворачивать
to use|использовать
to care|заботиться
to worry|беспокоиться
to lose|терять, проигрывать
to win|выигрывать
to send|отправлять
to fight|драться, бороться
to save|спасать, экономить
to trust|доверять
to drive|водить машину
to catch|ловить
to follow|следовать
to pull|тянуть
to push|толкать
to throw|бросать
to fall|падать
to break|ломать
to fix|чинить
to cut|резать
to touch|трогать
to kiss|целовать
to smile|улыбаться
to laugh|смеяться
to cry|плакать
to sing|петь
to dance|танцевать
to teach|учить (кого-то)
to explain|объяснять
to agree|соглашаться
to decide|решать
to choose|выбирать
to wish|желать
to promise|обещать
to imagine|представлять
to guess|угадывать, полагать
to suppose|предполагать
to seem|казаться
to become|становиться
to carry|нести
to build|строить
to grow|расти
to share|делиться
to join|присоединяться
to visit|посещать
to travel|путешествовать
to return|возвращаться
to arrive|прибывать
to enjoy|наслаждаться
to marry|жениться, выйти замуж
to wear|носить (одежду)
to cook|готовить
to clean|убирать, чистить
to wash|мыть
to wake up|просыпаться
to sit down|садиться
to get up|вставать
to hurt|причинять боль, болеть
to protect|защищать
to prove|доказывать
to accept|принимать
to allow|разрешать
to expect|ожидать
to realize|осознавать
to notice|замечать
to mind|возражать
to miss|скучать, пропускать
to steal|красть
to hide|прятать(ся)
to check|проверять
to count|считать
to deal|иметь дело
to fly|летать
to swim|плавать
to shoot|стрелять
wrong|неправильный
sure|уверенный
okay|хорошо, ладно
fine|прекрасный, в порядке
great|отличный
nice|приятный, милый
real|настоящий
true|правдивый, верный
ready|готовый
sad|грустный
dead|мёртвый
alive|живой
alone|один, одинокий
own|собственный
same|тот же
different|разный
other|другой
another|ещё один, другой
next|следующий
last|последний, прошлый
first|первый
second|второй; секунда
third|третий
long|длинный, долгий
short|короткий
high|высокий
low|низкий
young|молодой
early|ранний, рано
late|поздний, поздно
hard|твёрдый, трудный
soft|мягкий
strong|сильный
weak|слабый
full|полный
empty|пустой
free|свободный, бесплатный
busy|занятой
closed|закрытый
safe|безопасный
dangerous|опасный
important|важный
possible|возможный
impossible|невозможный
clear|ясный
simple|простой
special|особенный
strange|странный
funny|смешной
crazy|сумасшедший
stupid|глупый
smart|умный
pretty|хорошенький; довольно
ugly|некрасивый
rich|богатый
poor|бедный
sick|больной
tired|усталый
hungry|голодный
afraid|испуганный
angry|злой
quiet|тихий
loud|громкий
sweet|сладкий, милый
dear|дорогой (обращение)
perfect|идеальный
wonderful|чудесный
terrible|ужасный
amazing|потрясающий
serious|серьёзный
whole|целый
enough|достаточно
almost|почти
exactly|точно
probably|вероятно
actually|на самом деле
finally|наконец
anyway|в любом случае
together|вместе
away|прочь, далеко
back|назад
soon|скоро
later|позже
ago|тому назад
ever|когда-либо
once|однажды, один раз
twice|дважды
tonight|сегодня вечером
yet|ещё, уже (в вопросе)
instead|вместо
quite|вполне, довольно
rather|скорее
especially|особенно
of course|конечно
hey|эй
oh|о!
well|ну; хорошо
God|Бог
uncle|дядя
aunt|тётя
grandmother|бабушка
grandfather|дедушка
boyfriend|парень (молодой человек)
girlfriend|девушка (подруга)
neighbor|сосед
guest|гость
stranger|незнакомец
doctor|врач
teacher|учитель
student|студент
police|полиция
officer|офицер, полицейский
captain|капитан
king|король
queen|королева
president|президент
team|команда
group|группа
company|компания
business|бизнес, дело
job|работа, должность
problem|проблема
question|вопрос
idea|идея
reason|причина
truth|правда
lie|ложь
story|история
news|новости
word|слово
language|язык
number|число, номер
part|часть
end|конец
side|сторона
top|верх
bottom|низ
middle|середина
point|точка, смысл
case|случай, дело
fact|факт
kind|вид, добрый
sort|сорт, вид
chance|шанс
choice|выбор
plan|план
trouble|неприятность
mistake|ошибка
luck|удача
fun|веселье
game|игра
party|вечеринка
gift|подарок
surprise|сюрприз
dream|мечта, сон
fear|страх
heart|сердце
head|голова
face|лицо
eye|глаз
ear|ухо
nose|нос
mouth|рот
hair|волосы
hand|рука (кисть)
arm|рука
finger|палец
leg|нога
foot|ступня
body|тело
blood|кровь
skin|кожа
voice|голос
soul|душа
health|здоровье
pain|боль
death|смерть
birthday|день рождения
wedding|свадьба
holiday|праздник
weekend|выходные
moment|момент
noon|полдень
midnight|полночь
spring|весна
autumn|осень
past|прошлое
future|будущее
history|история (наука)
wall|стена
floor|пол, этаж
roof|крыша
garden|сад
yard|двор
building|здание
apartment|квартира
bathroom|ванная
bedroom|спальня
toilet|туалет
shower|душ
light|свет, лёгкий
fire|огонь
air|воздух
ground|земля (почва)
earth|Земля
sky|небо
star|звезда
moon|луна
wind|ветер
river|река
lake|озеро
forest|лес
tree|дерево
flower|цветок
grass|трава
stone|камень
island|остров
beach|пляж
field|поле
animal|животное
dog|собака
cat|кошка
horse|лошадь
bird|птица
cow|корова
pig|свинья
chicken|курица
mouse|мышь
bear|медведь
wolf|волк
bill|счёт, купюра
market|рынок
bag|сумка
box|коробка
bottle|бутылка
glass|стакан, стекло
cup|чашка
plate|тарелка
knife|нож
fork|вилка
spoon|ложка
food|еда
wine|вино
beer|пиво
juice|сок
rice|рис
potato|картофель
tomato|помидор
vegetables|овощи
fruit|фрукты
beef|говядина
pork|свинина
butter|сливочное масло
oil|масло (растительное)
cake|торт
chocolate|шоколад
ice cream|мороженое
sandwich|бутерброд
pizza|пицца
clothes|одежда
shirt|рубашка
dress|платье
shoes|обувь
hat|шляпа
coat|пальто
jacket|куртка
pants|брюки
ring|кольцо
glasses|очки
umbrella|зонт
picture|картина, фото
photo|фотография
music|музыка
song|песня
movie|фильм
newspaper|газета
magazine|журнал
radio|радио
TV|телевизор
camera|фотоаппарат
internet|интернет
email|электронная почта
message|сообщение
paper|бумага
pen|ручка
pencil|карандаш
page|страница
class|класс, занятие
lesson|урок
test|тест
exam|экзамен
university|университет
science|наука
art|искусство
sport|спорт
ball|мяч
football|футбол
gun|оружие, пистолет
war|война
peace|мир (не война)
army|армия
soldier|солдат
enemy|враг
law|закон
court|суд
judge|судья
prison|тюрьма
crime|преступление
murder|убийство
killer|убийца
victim|жертва
evidence|улики
secret|секрет
government|правительство
country|страна
state|государство, штат
power|власть, сила
control|контроль
system|система
service|служба, сервис
order|порядок, заказ
rule|правило
information|информация
risk|риск
danger|опасность
accident|авария, несчастный случай
emergency|чрезвычайная ситуация
medicine|лекарство
nurse|медсестра
dentist|стоматолог
fever|температура (жар)
headache|головная боль
heat|жара
ice|лёд
fog|туман
cloud|облако
storm|буря
north|север
south|юг
east|восток
west|запад
center|центр
corner|угол
bridge|мост
road|дорога
entrance|вход
line|линия, очередь
plane|самолёт
ship|корабль
boat|лодка
bike|велосипед
taxi|такси
trip|поездка
journey|путешествие (долгое)
flight|рейс, полёт
seat|место (сиденье)
luggage|багаж
border|граница
customs|таможня
visa|виза
tourist|турист
guide|гид
sightseeing|осмотр достопримечательностей
museum|музей
church|церковь
castle|замок
square|площадь, квадрат
village|деревня
neighborhood|район
address|адрес
factory|фабрика
farm|ферма
shop assistant|продавец
customer|клиент
manager|менеджер
worker|рабочий
owner|владелец
partner|партнёр
contract|договор
interview|собеседование
experience|опыт
skill|навык
career|карьера
project|проект
task|задача
result|результат
success|успех
goal|цель
progress|прогресс
example|пример
difference|разница
size|размер
color|цвет
shape|форма
weight|вес
height|рост, высота
age|возраст
half|половина
couple|пара
pair|пара (предметов)
dozen|дюжина
thousand|тысяча
million|миллион
eleven|одиннадцать
twelve|двенадцать
twenty|двадцать
thirty|тридцать
fifty|пятьдесят
Monday|понедельник
Tuesday|вторник
Wednesday|среда
Thursday|четверг
Friday|пятница
Saturday|суббота
Sunday|воскресенье
January|январь
February|февраль
March|март
April|апрель
May|май
June|июнь
July|июль
August|август
September|сентябрь
October|октябрь
November|ноябрь
December|декабрь
yellow|жёлтый
brown|коричневый
gray|серый
pink|розовый
orange|оранжевый; апельсин
purple|фиолетовый
dark|тёмный
bright|яркий
warm|тёплый
cool|прохладный; классный
wet|мокрый
dry|сухой
dirty|грязный
heavy|тяжёлый
thick|толстый
thin|тонкий
wide|широкий
narrow|узкий
deep|глубокий
round|круглый
flat|плоский; квартира
sharp|острый
tall|высокий (о человеке)
fat|толстый (о человеке)
handsome|красивый (о мужчине)
lovely|прелестный
friendly|дружелюбный
polite|вежливый
rude|грубый
lazy|ленивый
honest|честный
brave|смелый
proud|гордый
lonely|одинокий
nervous|нервный
calm|спокойный
excited|взволнованный
bored|скучающий
surprised|удивлённый
interested|заинтересованный
married|женатый, замужняя
famous|известный
popular|популярный
public|общественный
private|частный
local|местный
foreign|иностранный
national|национальный
international|международный
modern|современный
ancient|древний
main|главный
general|общий
certain|определённый, уверенный
usual|обычный
normal|нормальный
natural|естественный
human|человеческий
personal|личный
social|социальный
final|окончательный
able|способный
likely|вероятный
available|доступный
necessary|необходимый
useful|полезный
healthy|здоровый
tasty|вкусный
fresh|свежий
salty|солёный
spicy|острый (о еде)
sour|кислый
bitter|горький
raw|сырой
cooked|приготовленный
boiled|варёный
fried|жареный
quickly|быстро
slowly|медленно
carefully|осторожно
easily|легко
suddenly|внезапно
usually|обычно
often|часто
rarely|редко
recently|недавно
immediately|немедленно
inside|внутри
outside|снаружи
upstairs|наверху
downstairs|внизу
abroad|за границей
nowhere|нигде
however|однако
although|хотя
unless|если не
until|до тех пор пока
while|пока, в то время как
since|с (момента); так как
during|во время
against|против
along|вдоль
across|через (поперёк)
among|среди
beyond|за пределами
except|кроме
per|за, в (в час)
both|оба
either|любой из двух
neither|ни один из двух
few|немного (мало)
several|несколько
less|меньше
least|меньше всего
to answer the phone|ответить на звонок
to have fun|веселиться
to make sure|убедиться
to find out|выяснить
to look after|присматривать
to give up|сдаваться
to go on|продолжать
to get married|пожениться
to pick up|поднимать, забирать
to turn on|включать
to turn off|выключать
to put on|надевать
to take off|снимать; взлетать
to calm down|успокаиваться
to hurry up|торопиться
to shut up|замолчать
to grow up|взрослеть
to set|устанавливать
to fill|наполнять
to add|добавлять
to mix|смешивать
to boil|кипятить
to fry|жарить
to bake|печь
to taste|пробовать на вкус
to smell|пахнуть, нюхать
to rent|арендовать
to borrow|брать взаймы
to lend|давать взаймы
to spend|тратить
to earn|зарабатывать
to save money|копить деньги
to cost|стоить
to count on|рассчитывать на
to compare|сравнивать
to describe|описывать
to discuss|обсуждать
to mention|упоминать
to argue|спорить
to complain|жаловаться
to apologize|извиняться
to thank|благодарить
to invite|приглашать
to refuse|отказываться
to offer|предлагать
to suggest|советовать, предлагать
to recommend|рекомендовать
to prepare|готовить(ся)
to organize|организовывать
to manage|управлять, справляться
to create|создавать
to design|проектировать
to develop|развивать
to improve|улучшать
to increase|увеличивать
to reduce|уменьшать
to include|включать (в состав)
to contain|содержать
to depend|зависеть
to belong|принадлежать
to exist|существовать
to appear|появляться
to disappear|исчезать
to repeat|повторять
to practice|практиковаться
to study|изучать
to memorize|запоминать
to translate|переводить
to spell|писать по буквам
to pronounce|произносить
to type|печатать
to print|распечатывать
to download|скачивать
to upload|загружать
to search|искать (в интернете)
to click|нажимать
to connect|подключать
to charge|заряжать
to text|писать сообщение
to post|публиковать
to subscribe|подписываться
to delete|удалять
to lock|запирать
to unlock|отпирать
to knock|стучать
to climb|взбираться
to jump|прыгать
to hit|ударять
to kick|пинать
to shake|трясти
to wave|махать
to nod|кивать
to breathe|дышать
to rest|отдыхать
to relax|расслабляться
to feel better|чувствовать себя лучше
to recover|выздоравливать
to bleed|кровоточить
to burn|гореть, жечь
to freeze|замерзать
to melt|таять
to shine|светить
to blow|дуть
to fit|подходить (по размеру)
to suit|идти (быть к лицу)
to match|сочетаться
to hang|висеть, вешать
to lie down|ложиться
to rise|подниматься
to drop|ронять
to pour|наливать
to cover|накрывать
to fold|складывать
to pack|упаковывать
to unpack|распаковывать
to deliver|доставлять
to reply|отвечать (на письмо)
to warn|предупреждать
to threaten|угрожать
to attack|нападать
to escape|сбегать
to chase|преследовать
to arrest|арестовывать
to investigate|расследовать
to solve|решать (задачу)
to discover|обнаруживать
to invent|изобретать
to measure|измерять
to weigh|взвешивать
to divide|делить
to multiply|умножать
to fail|терпеть неудачу
to succeed|преуспевать
to deserve|заслуживать
to celebrate|праздновать
to congratulate|поздравлять
to vote|голосовать
to obey|подчиняться
to forgive|прощать
to blame|винить
to doubt|сомневаться
to admit|признавать
to deny|отрицать
to pretend|притворяться
to cheat|обманывать
to respect|уважать
to admire|восхищаться
to fall in love|влюбиться
to break up|расстаться
to date|встречаться (с кем-то)
to hug|обнимать
to raise children|растить детей
to feed|кормить
to bury|хоронить
to pray|молиться
to bless|благословлять
could|мог бы
would|бы (частица)
should|следует, стоит
must|должен
might|возможно, может
will|будет (будущее время)
to wonder|интересоваться, задаваться вопросом
to own|владеть
town|городок
cousin|двоюродный брат или сестра
sofa|диван
mirror|зеркало
lamp|лампа
pillow|подушка
blanket|одеяло
towel|полотенце
soap|мыло
toothbrush|зубная щётка
fridge|холодильник
oven|духовка
stove|плита
sink|раковина
trash|мусор
stairs|лестница
elevator|лифт
ceiling|потолок
carpet|ковёр
curtain|штора
shelf|полка
salad|салат
pasta|макароны
noodles|лапша
onion|лук
garlic|чеснок
carrot|морковь
cucumber|огурец
pepper|перец
lemon|лимон
banana|банан
grapes|виноград
strawberry|клубника
cherry|вишня
nut|орех
honey|мёд
jam|варенье
cookie|печенье
candy|конфета
sauce|соус
flour|мука
tooth|зуб
neck|шея
shoulder|плечо
knee|колено
stomach|живот
chest|грудь
brain|мозг
bone|кость
post office|почта
library|библиотека
cinema|кинотеатр
theater|театр
gym|спортзал
supermarket|супермаркет
bakery|пекарня
police station|полицейский участок
parking lot|парковка
temperature|температура
degree|градус
season|время года
habit|привычка
mood|настроение
taste|вкус
smell|запах`;
