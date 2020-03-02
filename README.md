# MonoRep

MonoRep - инструмент, используемый для:

  * Обнаружение зависимостей пакетов
  * Обновление зависимостей у зависимых пакетов
  * Коммит и публикация изменений

## Установка

```
npm install -g @tokenomica/monorep
mkdir my-monorep && cd my-monorep
monorep init
mkdir packages
mv ${PATH-TO}/my-projects/* packages
monorep list
```

## Конфигурация
Файл monorep.json в корневом каталоге MonoRep:
```
{
	"glob": {
		"search": "packages/*/package.json", // Шаблон поиска пакетов
		"ignore": [ // Шаблоны исключения пакетов
			"packages/**/node_modules/**/package.json"
		]
	},
	"pretty": { // Опции форматирования файлов package.json (https://github.com/Phrogz/NeatJSON)
		"wrap"         : 0,
		"sort"         : 1,
		"indent"       : "\t",
		"aligned"      : true,
		"objectPadding": 1,
		"afterComma"   : 1,
		"afterColonN"  : 1
	},
	"exec": {
		"add"    : "git add -A", // Команда добавления изменений в индекс VCS
		"commit" : "git commit -a --allow-empty-message", // Команда создания коммита VCS
		"push"   : "git push", // Команда экспорта коммитов в репозиторий VCS
		"update" : "npm install", // Команда обновления зависимостей пакета
		"publish": "npm publish" // Команда публикации пакета в репозитории
	},
	"no-publish": [ // Список не публикуемых в репозитории пакетов
		"@test/foo",
		"@test/foz"
	]
}
```

## Использование

  1. Добавление изменений в пакет и его публикация: `git add -A && git commit -am "update @tokenomica/ui" && npm pub`
  2. Просмотр списка пакетов, затронутых изменениями: `monorep up @tokenomica/ui --no-all`
  3. Обновление зависимых пакетов: `monorep up @tokenomica/ui -m "ui up"`
