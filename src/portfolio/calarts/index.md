---
title: "calarts"
displaytitle: "CAL ARTS: +6"
categories: web game
date: 2015-12-08
description: |
    rescue the artists in this game!
descriptionStyle:
    text:
        color: white
    background:
        color: black
layout: empty.nunjucks
alias:
    -   calarts
---
<!doctype html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>CAL ARTS: +6</title>

    <style>
        #selector
        {
            position : fixed;
            top      : 20px;
            right    : 20px;
        }
    </style>

    <script src="//ajax.googleapis.com/ajax/libs/jquery/1.10.1/jquery.min.js"></script>
    <script src="js/main.js"></script>

    <link rel="stylesheet" href="css/story.css">
 </head>
<body>
   <div id="story">

        <initscript>
            story.characterNames = characterNames;
        </initscript>

        <!-- Novel -->
        <title>CAL ARTS: +6</title>

        <!-- Objects -->
        <obj id="compiler" inventoryName="Compiler">
            <action id="Examine">
                A small, clear box, with a swirling cloud of shimmering blue gas inside.
                <br/>
                It is used to compile loose fragments of code and give them material form.
            </action>
            <action id="Collect">
                <when>!story.isInInventory('compiler');</when>
                {{ story.putInInventory('compiler'); }}
            </action>
            <action id="Compile">
                <when>story.isInInventory('compiler') && story.canCompile;</when>
                {{ story.doCompile(); }}
            </action>
        </obj>

        <obj id="elevator_key" inventoryName="Elevator Key">
            <action id="Examine">
                A small, silver key.
            </action>
            <action id="Collect">
                <when>!story.isInInventory('elevator_key');</when>
                {{ story.putInInventory('elevator_key'); }}
            </action>
        </obj>

        <obj id="planner" inventoryName="Planner">
            <action id="Examine">
                A small, clear box, with a swirling cloud of shimmering blue gas inside.
                <br/>
                It is used to compile loose fragments of code and give them material form.
            </action>
            <action id="Collect">
                <when>!story.isInInventory('planner');</when>
                {{ story.putInInventory('planner'); }}
            </action>
            <action id="Read">
                {{? story.canReadPlanner === true }}
                    {{ story.doReadPlanner(); }}
                {{??}}
                    Each page is full of text, but there is so much that you cannot read any of it.
                {{?}}
            </action>
        </obj>

        <!-- Pages -->
        <page id="intro">

        </page>

        <page id="room" class="first">
            <p>You wake up, the full moon's light flooding through your window,
            curtains fluttering in the breeze.</p>

            <p>You hear a high-pitched echo coming from your window, so you get out of bed &
            <show paragraph="goToWindow"> walk over to it.</show>
            </p>

            <paragraph id="goToWindow">
                A dolphin is waiting outside, it has a message for you.
                <p class="speech">
                    Oh no, you have to come now! Something terrible has happened at the CalArts factory!
                </p>
                <p>What's happened?</p>
                <p class="speech">
                    The artists, they've gone rogue!
                </p>
                You quickly pack your stuff, and <turn to="island">leave</turn>.
            </paragraph>
        </page>

        <page id="island">
            <span>The sun is shining brightly onto the island</span>
            {{? typeof story.firstVisit === 'undefined' }}
                <span> by the time you get there. You climb off the dolphin's back and onto the beach.</span>
                <p class="speech">
                    Thank-you for agreeing to help us. I think Callym is inside the factory, he'll be able to explain more.
                </p>
                {{ story.firstVisit = false; }}
            {{??}}.<br/><br/>{{?}}

            {{? story.isInInventory("compiler") }}
            {{??}}
                There is <interact with="compiler">something shiny</interact> lying on the floor.
                <br/>
                <br/>
            {{?}}

            The CalArts factory stands in the middle of the island, a tall witches tower pointing towards the sky, its glass sides slightly holographic in the sunlight. The <turn to="foyer">door</turn> is slightly ajar.
        </page>

        <page id="foyer">
            {{
                story.canCompile = true;
                story.doCompile = function()
                {
                    story.showParagraph("getCallym");
                };
            }}
            Around the edges of the room are sheets of paper, they look like they were blown there from a big gust of wind.
            <br/>
            <br/>
            There is a <turn to="corridor">glass door</turn> to the left of the room, and next to the
            {{? story.isInInventory('elevator_key') }}
                <turn to="elevator"> elevator </turn>
            {{??}}
                <span> elevator </span>
            {{?}}
            at the right of the room is a set of emergency stairs.
            <br/>
            <br/>
            The <turn to="island">door to the island</turn> seems to have been blown open.

            <paragraph id="getCallym">
                You shake the box, and the gas inside starts glowing with an etheral energy. The code fragments that are floating around in the air start collecting together. A ghostly figure seems to be emerging from the cloud, & then there is a flash of light.
                <p class="speech">
                    Thanks for saving me! I was trying a new thing and it just didn't work properly. Maybe we shouldn't be messing with the fabric of reality - or the internet!
                    <br/>
                    I think the rest of the artists are still here somewhere, please help them!
                    <br/>
                    Hey, take this <interact with="Callym">token</interact>, it might help.
                </p>
            </paragraph>
        </page>

        <page id="corridor">
            The fluorescent lights flicker overhead.
            <br/>
            Next to a <turn to="conference_room">door</turn> halfway down the corridor is a sign on the wall.
            <p class="speech">
                Conference Room
            </p>
            The corridor turns <turn to="corridor_2">right</turn>.
            <br/>
            <br/>
            <turn to="foyer">Turn back.</turn>
        </page>

        <page id="conference_room">
            {{? !story.isInInventory('Ruth Spencer-Jolly') }}
                {{
                    story.canReadPlanner = true;
                    story.doReadPlanner = function()
                    {
                        story.showParagraph("getRSJ");
                    };
                }}
                You find yourself on a small ledge, the floor has fallen away from reality, and you almost fall into a void.
                <br/>
                Looking up, the ceiling has also ceased to exist, and a spinning loading bar casts a sickly light into the room.
                <br/>
                In the middle of the room, there is a round conference table, with hundreds of ghost chairs floating around in a sphere. You notice shadows moving around on the walls, hundreds of loading bars that never fill up to the end.
                <br/>
                <br/>
                Floating above the table is Ruth Spencer-Jolly, furiously typing away.
            {{??}}
                The room contains a round table, with eight chairs around it.
                <br/>
                Ruth Spencer-Jolly is working on her laptop.
            {{?}}
            <br/>
            <turn to="corridor">Exit</turn>

            <paragraph id="getRSJ">
                The words float off the page, and when each one touches a shadowy loading bar, it fills to completion. Eventually, the shadows all disappear, and when they do so, the planner itself flies out of your hands, into the center of the spinning bar in the ceiling. When it touches it, the ceiling and floor pop back into existence, the tables and chairs float back into place, and the diary calmly floats down, landing next to Ruth Spencer-Jolly's laptop.
                <br/>
                <br/>
                She looks up at you.
                <p class="speech">
                    Arrgh, that was hell! I just couldn't make any progress as much as I could try!
                    <br/>
                    Thank-you so much for helping me! Take this as a <interact with="Ruth Spencer-Jolly">token</interact> of my gratitude.
                </p>
            </paragraph>
        </page>

        <page id="corridor_2">
            The corridor is a dead end, but on the floor is a <interact with="elevator_key">small key</interact>.
            <br/>
            <br/>
            <turn to="corridor">Turn back.</turn>
        </page>

        <page id="elevator">
            There is a row of buttons on the panel, however most of them are turned off, except for <turn to="basement">B</turn> and <turn to="top_floor">15</turn>.
            <br/>
            <br/>
            <turn to="foyer">Leave.</turn>
        </page>

        <page id="basement">
            The room is dark, apart from for a large neon sign.
            <p class="speech">
                PART TWO COMING SOON.
            </p>
        </page>

        <page id="top_floor">
            The room is full with a thick, pale pink mist. There is a table which contains a glass bowl full with <interact with="pink_fluff">pink fluff</interact>, and next to it is a <interact with="planner">planner</interact>. In the corner is a cauldron of thick, bubbling gunge.

            <turn to="elevator">Turn back.</turn>

            <obj id="pink_fluff">
                <action id="Throw in cauldron">
                    {{ story.showParagraph("getLu"); }}
                </action>
            </obj>

            <paragraph id="getLu">
                You throw the pink fluff into the cauldron, and a big puff of glitter comes out.
                <br/>
                <br/>
                When the glitter settles, Lu is standing in front of you.
                <p class="speech">
                    Thanks mate! I was just melting some stuff and I don't know what happened. Hey, take this <interact with="Lu">gunk</interact>.
                </p>
            </paragraph>
        </page>
    </div>

    <nav id="menu">
        <h2>Artists</h2>
        <div id="artistsHost">
            <ul id="artistsList"></ul>
        </div>
        <h2>Inventory</h2>
        <div id="inventoryHost"></div>
        <div id="footer">
            <a id="undoHost" href="#">Undo</a>
            <a id="saveHost" href="#">Save</a>
            <a id="restoreHost" href="#">Restore</a>
            <a id="resetHost" href="#">Reset</a>
        </div>
    </nav>

    <main id="panel">
        <header>
            <span class="toggle-button">☰</span>
            <span id="title"></span>
        </header>
        <div id="host"></div>
    </main>

    <div id="interactionHost"></div>

    <div id="undoStageHost"></div>

    <script>
        $(function()
        {
            makeArtists();

            new DedalusWeb(
            {
                domSource 			: $('#story'),
                domTarget 			: $('#host'),
                titleTarget 		: $('#title'),
                inventoryTarget 	: $('#inventoryHost'),
                interactionTarget 	: $('#interactionHost'),
                undoTarget 			: $('#undoHost'),
                undoStageTarget 	: $('#undoStageHost'),
                saveTarget 			: $('#saveHost'),
                restoreTarget 		: $('#restoreHost'),
                resetTarget 		: $('#resetHost'),
                onPrint 			: onPrintFade,
                onInventoryUpdate 	: function(items)
                {
                    console.log("inventory updated");
                    var i, item, newItems = [];
                    for (i = 0; i < items.length; i += 1)
                    {
                        item = items[i];

                        if (story.characterNames.indexOf(item.text()) != -1)
                        {
                            $('#artistsList > #' + CleanName(item.text())).html(item.clone(true));
                        }
                        else
                        {
                            newItems.push(item);
                        }
                        if (story.activatedArtist != null || typeof story.activatedArtist != 'undefined')
                        {
                            Activate(story.activatedArtist);
                        }
                    }
                    return newItems;
                }
            });

            for (var i = 0; i < story.characterNames.length; ++i)
            {
                var n = story.characterNames[i];
                var cn = CleanName(n);
                $("#artistsList").append("<li id='" + cn + "'>" + n + "</li>");
            }

            var slideout = new Slideout(
            {
                'panel': document.getElementById('panel'),
                'menu': document.getElementById('menu'),
                'duration': 1000
            });

            document.querySelector('.toggle-button').addEventListener('click', function()
            {
                slideout.toggle();
            });

            Artists['Callym'].Examine = function()
            {
                return "A small orb, full with an etheral light.";
            }
            Artists['Callym'].Get = function()
            {
                story.putInInventory(this.Name);
                return "You place the orb into your bag.";
            }
            Artists['Callym'].ActivateText = "Out of the orb comes a hologram of Callym.";

            Artists['RuthSpencerJolly'].Examine = function()
            {
                return "It is a portable hard-drive, I wonder what it has on it?";
            }
            Artists['RuthSpencerJolly'].Get = function()
            {
                story.putInInventory(this.Name);
                return "You place the drive in your bag.";
            }
            Artists['RuthSpencerJolly'].ActivateText = "You don't have a laptop with you.";

            Artists['Lu'].Examine = function()
            {
                return "A gross bit of pink gunk.";
            }
            Artists['Lu'].Get = function()
            {
                story.putInInventory(this.Name);
                return "You put the gunk in the pocket of your bag.";
            }
            Artists['Lu'].ActivateText = "You poke the gunk, it's a bit gross.";
        });

    </script>
</body>
</html>
