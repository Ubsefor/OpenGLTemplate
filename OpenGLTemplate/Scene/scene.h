#pragma once
#include "../common.h"
#include "../GameObject/game_object.h"
#include <vector>
class Scene
{
private:
  vector<GameObjectPtr> gameObjects;
public:
  void init(void (vector<GameObjectPtr>&));
  void update();
  void render();
  void render_ui();
  void exit();

};
